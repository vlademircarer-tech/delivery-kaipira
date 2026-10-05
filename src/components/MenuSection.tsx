import React, { useState, useMemo } from 'react';
import { Search, Plus, Utensils, Sparkles, Clock, Users, Flame } from 'lucide-react';
import { MenuItem } from '../types/delivery';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menu';
import { formatCurrency } from '../utils/formatters';

interface MenuSectionProps {
  onSelectItemForCustomization: (item: MenuItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  onSelectItemForCustomization,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'todos' || item.category === selectedCategory;
      const matchesQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="cardapio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-orange-600">
            Cardápio Oficial do Almoço
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Escolha sua refeição caipira
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Pratos preparados diariamente com ingredientes frescos da região de Piracicaba.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar prato, peixe ou marmita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Category Segmented Controls */}
      <div className="mt-6 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max p-1 bg-stone-100/90 rounded-xl border border-stone-200/70">
          {MENU_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 mt-6">
          <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">
            Nenhum prato encontrado
          </h3>
          <p className="text-sm text-stone-500 mt-1">
            Tente buscar por outro termo ou selecione todas as categorias.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todos');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Container with Fallback */}
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  {item.popular && (
                    <div className="absolute top-3 left-3 bg-orange-600/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-200" />
                      <span>Especialidade Kaipira</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.serves}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.prepTime}</span>
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Price and Personalizar CTA */}
              <div className="p-5 pt-0 mt-2 flex items-center justify-between border-t border-stone-100 pt-4">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-medium">
                    A partir de
                  </span>
                  <span className="text-lg font-extrabold text-orange-950 tabular-nums">
                    {formatCurrency(item.price)}
                  </span>
                </div>

                <button
                  onClick={() => onSelectItemForCustomization(item)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Personalizar & Pedir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
