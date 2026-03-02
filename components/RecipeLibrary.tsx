import React, { useState } from 'react';
import { Search, ChefHat, Clock, Flame, ChevronRight, ArrowLeft } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  category: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  instructions: string[];
  image?: string;
}

const RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Crepioca de Frango Cremoso',
    category: 'Café da Manhã',
    time: '15 min',
    calories: 320,
    protein: 28,
    carbs: 12,
    fats: 14,
    ingredients: [
      '1 ovo inteiro',
      '2 colheres de sopa de goma de tapioca',
      '1 colher de sopa de requeijão light',
      '100g de frango desfiado temperado',
      'Sal e orégano a gosto'
    ],
    instructions: [
      'Em um bowl, bata o ovo com a goma de tapioca e o requeijão até ficar homogêneo.',
      'Tempere com sal e orégano.',
      'Aqueça uma frigideira antiaderente e despeje a massa.',
      'Quando firmar, adicione o frango desfiado e dobre ao meio.',
      'Deixe dourar dos dois lados e sirva.'
    ]
  },
  {
    id: '2',
    title: 'Salada de Atum com Grão de Bico',
    category: 'Almoço/Jantar',
    time: '10 min',
    calories: 380,
    protein: 35,
    carbs: 25,
    fats: 12,
    ingredients: [
      '1 lata de atum em água escorrido',
      '100g de grão de bico cozido',
      '1 tomate picado',
      '1/2 cebola roxa picada',
      'Salsinha e cebolinha a gosto',
      'Azeite de oliva e limão para temperar'
    ],
    instructions: [
      'Em uma tigela, misture o atum, o grão de bico, o tomate e a cebola.',
      'Tempere com azeite, limão, sal e pimenta.',
      'Finalize com salsinha e cebolinha fresca.',
      'Sirva gelado ou em temperatura ambiente.'
    ]
  },
  {
    id: '3',
    title: 'Overnight Oats de Morango',
    category: 'Lanche',
    time: '5 min (+4h geladeira)',
    calories: 280,
    protein: 12,
    carbs: 45,
    fats: 6,
    ingredients: [
      '30g de aveia em flocos',
      '100ml de leite desnatado ou vegetal',
      '1 colher de sopa de chia',
      '1 colher de chá de mel',
      '5 morangos picados'
    ],
    instructions: [
      'Em um pote de vidro, misture a aveia, o leite, a chia e o mel.',
      'Mexa bem para a chia não grudar.',
      'Adicione os morangos por cima.',
      'Tampe e leve à geladeira por pelo menos 4 horas ou durante a noite.',
      'Consuma gelado.'
    ]
  },
  {
    id: '4',
    title: 'Escondidinho de Batata Doce e Patinho',
    category: 'Almoço/Jantar',
    time: '40 min',
    calories: 420,
    protein: 38,
    carbs: 48,
    fats: 8,
    ingredients: [
      '150g de batata doce cozida e amassada',
      '120g de patinho moído refogado',
      '1 fatia de queijo muçarela light',
      'Temperos a gosto (alho, cebola, páprica)'
    ],
    instructions: [
      'Refogue a carne moída com os temperos até ficar sequinha.',
      'Amasse a batata doce cozida até formar um purê (pode usar um pouco de leite desnatado se precisar).',
      'Em um refratário individual, faça uma cama com a carne moída.',
      'Cubra com o purê de batata doce.',
      'Coloque a fatia de queijo por cima.',
      'Leve ao forno ou airfryer por 10-15 minutos para gratinar.'
    ]
  },
  {
    id: '5',
    title: 'Smoothie Proteico de Frutas Vermelhas',
    category: 'Lanche/Pós-Treino',
    time: '5 min',
    calories: 220,
    protein: 24,
    carbs: 25,
    fats: 2,
    ingredients: [
      '1 scoop de Whey Protein sabor Baunilha ou Morango',
      '100g de mix de frutas vermelhas congeladas',
      '200ml de água ou água de coco',
      'Gelo a gosto'
    ],
    instructions: [
      'Coloque todos os ingredientes no liquidificador.',
      'Bata até obter uma consistência cremosa.',
      'Se ficar muito grosso, adicione um pouco mais de água.',
      'Sirva imediatamente.'
    ]
  }
];

interface RecipeLibraryProps {
  onBack?: () => void;
}

export const RecipeLibrary: React.FC<RecipeLibraryProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const categories = Array.from(new Set(RECIPES.map(r => r.category)));

  const filteredRecipes = RECIPES.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory ? recipe.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  if (selectedRecipe) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 animate-fadeIn">
        <button 
          onClick={() => setSelectedRecipe(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} /> Voltar para receitas
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wide">
                    {selectedRecipe.category}
                </span>
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <Clock size={14} /> {selectedRecipe.time}
                </div>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">{selectedRecipe.title}</h2>

            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-center">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Calorias</div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{selectedRecipe.calories}</div>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl text-center">
                    <div className="text-xs text-rose-500 uppercase font-bold mb-1">Proteína</div>
                    <div className="text-xl font-bold text-rose-700 dark:text-rose-300">{selectedRecipe.protein}g</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-center">
                    <div className="text-xs text-blue-500 uppercase font-bold mb-1">Carbo</div>
                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{selectedRecipe.carbs}g</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-center">
                    <div className="text-xs text-amber-500 uppercase font-bold mb-1">Gordura</div>
                    <div className="text-xl font-bold text-amber-700 dark:text-amber-300">{selectedRecipe.fats}g</div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <ChefHat size={20} className="text-blue-500" /> Ingredientes
                </h3>
                <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                            <span className="text-slate-700 dark:text-slate-300">{ing}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Flame size={20} className="text-orange-500" /> Modo de Preparo
                </h3>
                <ol className="space-y-4">
                    {selectedRecipe.instructions.map((inst, idx) => (
                        <li key={idx} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm">
                                {idx + 1}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{inst}</p>
                        </li>
                    ))}
                </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ChefHat className="text-blue-600" /> Biblioteca de Receitas
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Receitas saudáveis e práticas para sua dieta.</p>
        </div>
        
        <div className="relative w-full md:w-64">
            <input 
                type="text" 
                placeholder="Buscar receitas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
            Todas
        </button>
        {categories.map(cat => (
            <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
                {cat}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
            <div 
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group"
            >
                <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wide">
                            {recipe.category}
                        </span>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <Clock size={12} /> {recipe.time}
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {recipe.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Calorias</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{recipe.calories}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Proteína</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{recipe.protein}g</span>
                        </div>
                        <div className="ml-auto">
                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
