import { PIRACICABA_NEIGHBORHOODS } from '../data/piracicabaNeighborhoods';
import { NeighborhoodDelivery } from '../types/delivery';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

export interface CepLookupResult {
  success: boolean;
  data?: {
    cep: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    matchedNeighborhood?: NeighborhoodDelivery;
  };
  error?: string;
}

export async function lookupCep(rawCep: string): Promise<CepLookupResult> {
  const clean = rawCep.replace(/\D/g, '');

  if (clean.length !== 8) {
    return { success: false, error: 'O CEP deve conter 8 dígitos.' };
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!res.ok) {
      return { success: false, error: 'Não foi possível consultar os Correios no momento.' };
    }

    const data: ViaCepResponse = await res.json();

    if (data.erro) {
      return { success: false, error: 'CEP não encontrado. Por favor, verifique os números.' };
    }

    // Try matching the neighborhood with our Piracicaba delivery zones
    const returnedBairro = (data.bairro || '').trim().toLowerCase();
    const matched = PIRACICABA_NEIGHBORHOODS.find((n) => {
      const nName = n.name.toLowerCase();
      return nName.includes(returnedBairro) || returnedBairro.includes(n.name.split(' ')[0].toLowerCase());
    });

    return {
      success: true,
      data: {
        cep: data.cep,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || 'Piracicaba',
        state: data.uf || 'SP',
        matchedNeighborhood: matched,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Erro ao consultar CEP. Preencha seu endereço manualmente.',
    };
  }
}
