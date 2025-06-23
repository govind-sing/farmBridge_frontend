import React, { useState, useEffect } from 'react';


// 50 Common Food Ingredients
const foodIngredients = [
  { name: 'Salt (Sodium Chloride)', purpose: 'Flavor enhancer, preservative', adi: 'Not Specified', healthImpact: 'Essential mineral; excessive intake linked to high blood pressure.' },
  { name: 'Sugar (Sucrose)', purpose: 'Sweetener', adi: 'Not Specified', healthImpact: 'Provides energy; overconsumption may lead to obesity and diabetes.' },
  { name: 'Vegetable Oil (Olive/Canola)', purpose: 'Fat source', adi: 'Not Specified', healthImpact: 'Source of essential fats; high intake may contribute to weight gain.' },
  { name: 'Citric Acid', purpose: 'Acidulant, preservative', adi: 'Not Specified', healthImpact: 'Enhances flavor and preserves freshness; generally safe.' },
  { name: 'Monosodium Glutamate (MSG)', purpose: 'Flavor enhancer', adi: 'Not Specific, GRAS', healthImpact: 'Enhances umami taste; safe for most people, though some report sensitivity.' },
  { name: 'High Fructose Corn Syrup', purpose: 'Sweetener', adi: 'Not Specified', healthImpact: 'Adds sweetness; overconsumption linked to metabolic issues.' },
  { name: 'Sodium Benzoate', purpose: 'Preservative', adi: '0-5 mg/kg', healthImpact: 'Prevents microbial growth; may form benzene with vitamin C under certain conditions.' },
  { name: 'Potassium Sorbate', purpose: 'Preservative', adi: '0-25 mg/kg', healthImpact: 'Inhibits mold and yeast; generally safe with minimal side effects.' },
  { name: 'Calcium Propionate', purpose: 'Preservative', adi: '0-7 mg/kg', healthImpact: 'Prevents mold in baked goods; safe when used as directed.' },
  { name: 'Ascorbic Acid (Vitamin C)', purpose: 'Antioxidant, nutrient', adi: 'Not Specified', healthImpact: 'Boosts immunity; essential nutrient and antioxidant.' },
  { name: 'Natural Flavors', purpose: 'Enhances taste', adi: 'Not Specified', healthImpact: 'Varies by source; generally recognized as safe.' },
  { name: 'Modified Corn Starch', purpose: 'Thickener, stabilizer', adi: 'Not Specified', healthImpact: 'Improves texture; widely used and considered safe.' },
  { name: 'Soy Lecithin', purpose: 'Emulsifier', adi: 'Not Specified', healthImpact: 'Helps blend ingredients; safe unless soy allergies are present.' },
  { name: 'Vinegar (Acetic Acid)', purpose: 'Flavoring, preservative', adi: 'Not Specified', healthImpact: 'Adds tanginess; natural and safe.' },
  { name: 'Corn Syrup', purpose: 'Sweetener', adi: 'Not Specified', healthImpact: 'Provides sweetness; overuse may lead to blood sugar spikes.' },
  { name: 'Dextrose', purpose: 'Sweetener', adi: 'Not Specified', healthImpact: 'Simple sugar; safe in moderation.' },
  { name: 'Maltodextrin', purpose: 'Thickener, filler', adi: 'Not Specified', healthImpact: 'Improves texture; can raise blood sugar.' },
  { name: 'Whey Protein', purpose: 'Protein fortification', adi: 'Not Specified', healthImpact: 'High-quality protein; safe for most but may affect lactose-sensitive individuals.' },
  { name: 'Casein', purpose: 'Protein fortification', adi: 'Not Specified', healthImpact: 'Milk protein; safe unless allergic.' },
  { name: 'Egg Protein', purpose: 'Protein source', adi: 'Not Specified', healthImpact: 'Provides essential amino acids; caution for egg allergies.' },
  { name: 'Cocoa Powder', purpose: 'Flavoring, color', adi: 'Not Specified', healthImpact: 'Rich in antioxidants; safe in moderation.' },
  { name: 'Cocoa Butter', purpose: 'Fat source, texture', adi: 'Not Specified', healthImpact: 'Natural fat; used for texture and flavor.' },
  { name: 'Lecithin (Soy)', purpose: 'Emulsifier', adi: 'Not Specified', healthImpact: 'Helps blend; safe unless soy allergy exists.' },
  { name: 'Baking Soda (Sodium Bicarbonate)', purpose: 'Leavening agent', adi: 'Not Specified', healthImpact: 'Helps dough rise; safe in food amounts.' },
  { name: 'Baking Powder', purpose: 'Leavening agent', adi: 'Not Specified', healthImpact: 'Creates carbon dioxide; safe when used appropriately.' },
  { name: 'Gelatin', purpose: 'Thickener, stabilizer', adi: 'Not Specified', healthImpact: 'Derived from collagen; safe for most uses.' },
  { name: 'Pectin', purpose: 'Gelling agent', adi: 'Not Specified', healthImpact: 'Natural fiber from fruit; aids in thickening.' },
  { name: 'Carrageenan', purpose: 'Thickener, stabilizer', adi: 'Not Specified', healthImpact: 'Extracted from seaweed; safe, though debate exists over inflammation.' },
  { name: 'Guar Gum', purpose: 'Thickener', adi: 'Not Specified', healthImpact: 'Natural thickener; safe in food applications.' },
  { name: 'Xanthan Gum', purpose: 'Thickener', adi: 'Not Specified', healthImpact: 'Stabilizes mixtures; safe and used widely.' },
  { name: 'Enzymes (Amylase)', purpose: 'Breaks down starches', adi: 'Not Specified', healthImpact: 'Improves texture; safe and naturally occurring.' },
  { name: 'Natural Colors (Caramel Color)', purpose: 'Coloring', adi: 'Not Specified', healthImpact: 'Adds color; safe when within regulated limits.' },
  { name: 'Beta-Carotene', purpose: 'Coloring, nutrient', adi: 'Not Specified', healthImpact: 'Provides vitamin A; safe and naturally derived.' },
  { name: 'Riboflavin (Vitamin B2)', purpose: 'Nutrient, coloring', adi: 'Not Specified', healthImpact: 'Essential vitamin; safe and beneficial.' },
  { name: 'Niacin (Vitamin B3)', purpose: 'Nutrient', adi: 'Not Specified', healthImpact: 'Supports metabolism; safe in recommended amounts.' },
  { name: 'Thiamine (Vitamin B1)', purpose: 'Nutrient', adi: 'Not Specified', healthImpact: 'Essential for energy production; safe.' },
  { name: 'Folic Acid', purpose: 'Nutrient', adi: 'Not Specified', healthImpact: 'Important for cell growth; safe and beneficial.' },
  { name: 'Iron (Ferrous Sulfate)', purpose: 'Fortification', adi: 'Not Specified', healthImpact: 'Prevents anemia; safe when dosed correctly.' },
  { name: 'Calcium Carbonate', purpose: 'Fortification', adi: 'Not Specified', healthImpact: 'Strengthens bones; safe in food applications.' },
  { name: 'Zinc Oxide (Fortification)', purpose: 'Nutrient fortification', adi: 'Not Specified', healthImpact: 'Essential mineral; safe in regulated amounts.' },
  { name: 'L-Carnitine', purpose: 'Nutrient', adi: 'Not Specified', healthImpact: 'Helps energy production; safe as a supplement.' },
  { name: 'Inositol', purpose: 'Nutrient', adi: 'Not Specified', healthImpact: 'Supports cell health; safe in food.' },
  { name: 'PABA (Para-Aminobenzoic Acid)', purpose: 'Nutrient', adi: 'Not Specified', healthImpact: 'Important for metabolism; safe in low doses.' },
  { name: 'Lecithin (Sunflower)', purpose: 'Emulsifier', adi: 'Not Specified', healthImpact: 'Alternative to soy lecithin; safe and hypoallergenic.' },
  { name: 'Garlic Extract', purpose: 'Flavoring, preservative', adi: 'Not Specified', healthImpact: 'Adds flavor; has antimicrobial properties.' },
  { name: 'Onion Powder', purpose: 'Flavoring', adi: 'Not Specified', healthImpact: 'Adds savory flavor; safe and natural.' },
  { name: 'Paprika Oleoresin', purpose: 'Coloring, flavoring', adi: 'Not Specified', healthImpact: 'Provides red color; natural and safe.' },
  { name: 'Turmeric Extract', purpose: 'Coloring, flavoring', adi: 'Not Specified', healthImpact: 'Adds yellow color; anti-inflammatory benefits.' },
  { name: 'Rosemary Extract', purpose: 'Antioxidant, preservative', adi: 'Not Specified', healthImpact: 'Natural preservative; safe and extends shelf life.' },
];

// 10 Dangerous Food Ingredients
const prohibitedFoodIngredients = [
  { name: 'Lead', purpose: 'Contaminant', adverseEffects: 'Neurological damage; highly toxic even in small amounts.' },
  { name: 'Mercury', purpose: 'Contaminant', adverseEffects: 'Brain and kidney damage; dangerous for all ages.' },
  { name: 'Arsenic', purpose: 'Contaminant', adverseEffects: 'Carcinogenic; causes skin lesions and other health issues.' },
  { name: 'Cadmium', purpose: 'Contaminant', adverseEffects: 'Kidney damage and bone loss; carcinogenic.' },
  { name: 'Benzene', purpose: 'Contaminant', adverseEffects: 'Leukemia and blood disorders; strictly regulated.' },
  { name: 'Formaldehyde', purpose: 'Contaminant', adverseEffects: 'Carcinogenic; irritates respiratory system.' },
  { name: 'Acrylamide', purpose: 'Processing contaminant', adverseEffects: 'Potential carcinogen and neurotoxin.' },
  { name: 'Trans Fats', purpose: 'Fat substitute', adverseEffects: 'Raises LDL, lowers HDL; linked to heart disease.' },
  { name: 'Polychlorinated Biphenyls (PCBs)', purpose: 'Environmental contaminant', adverseEffects: 'Carcinogenic and neurotoxic.' },
  { name: 'Polybrominated Biphenyls (PBBs)', purpose: 'Environmental contaminant', adverseEffects: 'Hormone disruption; persistent in environment.' },
];

// 50 Common Cosmetic Ingredients
const cosmeticIngredients = [
  { name: 'Water', purpose: 'Solvent', safetyLevel: 'Safe', healthImpact: 'Essential base ingredient; non-toxic.' },
  { name: 'Glycerin', purpose: 'Moisturizer', safetyLevel: 'Safe', healthImpact: 'Hydrates skin; widely used.' },
  { name: 'Cetearyl Alcohol', purpose: 'Emulsifier, thickener', safetyLevel: 'Safe', healthImpact: 'Improves texture; safe for most.' },
  { name: 'Aloe Vera Extract', purpose: 'Soothing agent', safetyLevel: 'Safe', healthImpact: 'Calms and hydrates skin; beneficial.' },
  { name: 'Vitamin E', purpose: 'Antioxidant', safetyLevel: 'Safe', healthImpact: 'Protects skin and nourishes.' },
  { name: 'Hyaluronic Acid', purpose: 'Hydrator', safetyLevel: 'Safe', healthImpact: 'Plumps skin; effective hydration.' },
  { name: 'Retinol', purpose: 'Anti-aging', safetyLevel: 'Safe in low concentrations', healthImpact: 'Promotes cell turnover; may irritate sensitive skin.' },
  { name: 'Salicylic Acid', purpose: 'Exfoliant, acne treatment', safetyLevel: 'Safe up to 2%', healthImpact: 'Helps clear pores; can be drying if overused.' },
  { name: 'Niacinamide', purpose: 'Brightening, anti-inflammatory', safetyLevel: 'Safe', healthImpact: 'Improves skin tone; supports barrier repair.' },
  { name: 'Ceramides', purpose: 'Barrier repair', safetyLevel: 'Safe', healthImpact: 'Restores skin barrier; essential for hydration.' },
  { name: 'Witch Hazel', purpose: 'Astringent, soothing', safetyLevel: 'Safe', healthImpact: 'Reduces inflammation; natural and gentle.' },
  { name: 'Coconut Oil', purpose: 'Moisturizer', safetyLevel: 'Safe', healthImpact: 'Hydrates and nourishes; may clog pores in some.' },
  { name: 'Shea Butter', purpose: 'Moisturizer, emollient', safetyLevel: 'Safe', healthImpact: 'Rich in fats; deeply moisturizes and heals.' },
  { name: 'Essential Oils (Lavender)', purpose: 'Fragrance, therapeutic', safetyLevel: 'Safe when diluted', healthImpact: 'Natural scent; may cause irritation if undiluted.' },
  { name: 'Essential Oils (Tea Tree)', purpose: 'Antimicrobial', safetyLevel: 'Safe when diluted', healthImpact: 'Fights acne; caution if undiluted.' },
  { name: 'Dimethicone', purpose: 'Skin protectant', safetyLevel: 'Safe', healthImpact: 'Smooths skin; non-comedogenic.' },
  { name: 'Propylene Glycol', purpose: 'Solvent, humectant', safetyLevel: 'Safe', healthImpact: 'Retains moisture; may irritate very sensitive skin.' },
  { name: 'Squalane', purpose: 'Emollient', safetyLevel: 'Safe', healthImpact: 'Softens skin; lightweight and non-greasy.' },
  { name: 'Jojoba Oil', purpose: 'Moisturizer', safetyLevel: 'Safe', healthImpact: 'Nourishes skin; mimics natural sebum.' },
  { name: 'Argan Oil', purpose: 'Moisturizer', safetyLevel: 'Safe', healthImpact: 'Rich in nutrients; hydrates and repairs.' },
  { name: 'Panthenol', purpose: 'Moisturizer', safetyLevel: 'Safe', healthImpact: 'Hydrates and improves skin barrier.' },
  { name: 'Allantoin', purpose: 'Soothing agent', safetyLevel: 'Safe', healthImpact: 'Calms irritated skin; promotes healing.' },
  { name: 'Chamomile Extract', purpose: 'Soothing, anti-inflammatory', safetyLevel: 'Safe', healthImpact: 'Calms skin; gentle and natural.' },
  { name: 'Green Tea Extract', purpose: 'Antioxidant', safetyLevel: 'Safe', healthImpact: 'Protects against free radicals; soothing.' },
  { name: 'Rosehip Oil', purpose: 'Moisturizer, nutrient', safetyLevel: 'Safe', healthImpact: 'Rich in vitamins; repairs and nourishes.' },
  { name: 'Beeswax', purpose: 'Emulsifier, thickener', safetyLevel: 'Safe', healthImpact: 'Stabilizes formulations; natural and safe.' },
  { name: 'Carnauba Wax', purpose: 'Thickener', safetyLevel: 'Safe', healthImpact: 'Adds gloss and stability; natural.' },
  { name: 'Menthol', purpose: 'Cooling agent', safetyLevel: 'Safe', healthImpact: 'Provides cooling sensation; may irritate if overused.' },
  { name: 'Camphor', purpose: 'Cooling agent', safetyLevel: 'Safe', healthImpact: 'Soothes and refreshes; caution with high doses.' },
  { name: 'Peptides', purpose: 'Anti-aging', safetyLevel: 'Safe', healthImpact: 'Firms skin; effective in low concentrations.' },
  { name: 'Collagen', purpose: 'Hydrator, anti-aging', safetyLevel: 'Safe', healthImpact: 'Improves skin elasticity; safe in topical use.' },
  { name: 'Coenzyme Q10', purpose: 'Antioxidant', safetyLevel: 'Safe', healthImpact: 'Protects skin cells; supports energy production.' },
  { name: 'Glycolic Acid', purpose: 'Exfoliant', safetyLevel: 'Safe in low concentrations', healthImpact: 'Improves skin texture; may cause irritation.' },
  { name: 'Lactic Acid', purpose: 'Exfoliant', safetyLevel: 'Safe', healthImpact: 'Smoothens skin; mild exfoliation.' },
  { name: 'Zinc Oxide (Sunscreen)', purpose: 'UV protection', safetyLevel: 'Safe', healthImpact: 'Blocks UV rays; non-irritating.' },
  { name: 'Titanium Dioxide (Sunscreen)', purpose: 'UV protection', safetyLevel: 'Safe', healthImpact: 'Reflects UV rays; safe for most skin types.' },
  { name: 'Fragrance (Natural)', purpose: 'Scent', safetyLevel: 'Varies', healthImpact: 'Adds pleasant scent; may cause allergies.' },
  { name: 'Soy Protein', purpose: 'Conditioning agent', safetyLevel: 'Safe', healthImpact: 'Improves texture; safe unless allergic.' },
  { name: 'Rice Extract', purpose: 'Antioxidant', safetyLevel: 'Safe', healthImpact: 'Nourishes skin; supports cell renewal.' },
  { name: 'Bamboo Extract', purpose: 'Nutrient', safetyLevel: 'Safe', healthImpact: 'Rich in silica; supports skin strength.' },
  { name: 'Arbutin', purpose: 'Brightening', safetyLevel: 'Safe in low concentrations', healthImpact: 'Helps lighten hyperpigmentation; safe when used properly.' },
  { name: 'Kojic Acid', purpose: 'Brightening', safetyLevel: 'Safe in low concentrations', healthImpact: 'Reduces dark spots; caution for sensitive skin.' },
  { name: 'Ferulic Acid', purpose: 'Antioxidant', safetyLevel: 'Safe', healthImpact: 'Boosts stability of vitamins; supports anti-aging.' },
  { name: 'Resveratrol', purpose: 'Antioxidant', safetyLevel: 'Safe', healthImpact: 'Protects against free radicals; skin-soothing.' },
  { name: 'Pomegranate Extract', purpose: 'Antioxidant', safetyLevel: 'Safe', healthImpact: 'Rich in vitamins; supports skin renewal.' },
  { name: 'Caffeine', purpose: 'Stimulant, depuffer', safetyLevel: 'Safe', healthImpact: 'Reduces puffiness; safe in topical use.' },
  { name: 'Propolis Extract', purpose: 'Antimicrobial', safetyLevel: 'Safe', healthImpact: 'Natural antiseptic; supports healing.' },
  { name: 'Beta-Glucan', purpose: 'Soothing, moisturizing', safetyLevel: 'Safe', healthImpact: 'Calms skin; promotes hydration.' },
  { name: 'Sodium PCA', purpose: 'Humectant', safetyLevel: 'Safe', healthImpact: 'Retains moisture; supports skin hydration.' },
];

// 10 Dangerous Cosmetic Ingredients
const prohibitedCosmeticIngredients = [
  { name: 'Formaldehyde', purpose: 'Preservative', adverseEffects: 'Carcinogenic; can cause skin irritation and allergies.' },
  { name: 'Mercury Compounds', purpose: 'Skin lightening', adverseEffects: 'Neurotoxic; damages kidneys and brain.' },
  { name: 'Lead Acetate', purpose: 'Hair dye', adverseEffects: 'Lead poisoning; neurological and developmental issues.' },
  { name: 'Hexachlorophene', purpose: 'Antiseptic', adverseEffects: 'Neurotoxic; harmful to infants.' },
  { name: 'Phthalates (e.g. DEHP)', purpose: 'Plasticizer', adverseEffects: 'Endocrine disruptors; linked to reproductive issues.' },
  { name: 'Parabens (some forms)', purpose: 'Preservative', adverseEffects: 'Possible hormone disruption; controversial.' },
  { name: 'Triclosan', purpose: 'Antibacterial', adverseEffects: 'May disrupt hormones and contribute to resistance.' },
  { name: 'Coal Tar', purpose: 'Colorant', adverseEffects: 'Carcinogenic; irritates skin.' },
  { name: 'Hydroquinone', purpose: 'Skin lightening', adverseEffects: 'Can cause ochronosis and potential cancer risk.' },
  { name: 'Benzene', purpose: 'Contaminant', adverseEffects: 'Linked to leukemia and blood disorders.' },
];

// -----------------------
// INGREDIENT MATCHER COMPONENT
// -----------------------
function IngredientMatcher() {
  const [productType, setProductType] = useState('Food'); 
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);

  const getSearchLink = (ingredient, type) => {
    const encodedName = encodeURIComponent(ingredient);
    if (type === 'Food') {
      return `https://www.google.com/search?q=${encodedName}+in+foods`; 
    } else {
      return `https://www.google.com/search?q=${encodedName}+in+cosmetics`; 
    }
  };

  const handleMatch = () => {
    const ingredientsInput = inputText.split(',').map(ing => ing.trim()).filter(ing => ing !== '');
    const safeList = productType === 'Food' ? foodIngredients : cosmeticIngredients;
    const dangerList = productType === 'Food' ? prohibitedFoodIngredients : prohibitedCosmeticIngredients;
    
    const matchedResults = ingredientsInput.map(ing => {
      const dangerMatch = dangerList.find(item => item.name.toLowerCase().includes(ing.toLowerCase()));
      if (dangerMatch) {
        return { ingredient: ing, category: 'Not Safe', details: dangerMatch.adverseEffects };
      }
      const safeMatch = safeList.find(item => item.name.toLowerCase().includes(ing.toLowerCase()));
      if (safeMatch) {
        return { ingredient: ing, category: 'Safe', details: productType === 'Food' ? safeMatch.healthImpact : safeMatch.healthImpact };
      }
      return { 
        ingredient: ing, 
        category: 'Unknown', 
        details: 'Ingredient not found in database.', 
        link: getSearchLink(ing, productType) 
      };
    });
    setResults(matchedResults);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4">Ingredient Matcher</h2>
      <p className="mb-4 text-gray-700">Enter a comma-separated list of ingredients from your product label. Select the product type below, then click "Match Ingredients" to see which ingredients are safe or not safe.</p>
      <div className="mb-4">
        <select 
          value={productType} 
          onChange={(e) => setProductType(e.target.value)} 
          className="p-2 border rounded mr-4"
        >
          <option value="Food">Food Product</option>
          <option value="Cosmetic">Cosmetic Product</option>
        </select>
        <input
          type="text"
          placeholder="e.g., Sugar, Salt, Citric Acid"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="p-2 border rounded w-2/3"
        />
      </div>
      <button 
        onClick={handleMatch} 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
      >
        Match Ingredients
      </button>
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Results:</h3>
          <table className="w-full bg-gray-50 border rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Ingredient</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Details</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2 border">
                    {res.category === 'Unknown' ? (
                      <a 
                        href={res.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline"
                      >
                        {res.ingredient}
                      </a>
                    ) : (
                      res.ingredient
                    )}
                  </td>
                  <td className="p-2 border">
                    {res.category === 'Safe' ? (
                      <span className="text-green-700 font-semibold">{res.category}</span>
                    ) : res.category === 'Not Safe' ? (
                      <span className="text-red-700 font-semibold">{res.category}</span>
                    ) : (
                      <span className="text-gray-700">{res.category}</span>
                    )}
                  </td>
                  <td className="p-2 border">{res.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -----------------------
// INGREDIENT TABLE COMPONENT (Reusable)
// -----------------------
function IngredientTable({ ingredients, isProhibited, title, dataKey, productType }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const itemsPerPage = 8;
  const totalPages = Math.ceil(ingredients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentIngredients = ingredients.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const newTotalPages = Math.ceil(ingredients.length / itemsPerPage);
    if (currentPage > newTotalPages) setCurrentPage(newTotalPages || 1);
  }, [ingredients, currentPage]);

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getIngredientLink = (ingredientName, type) => {
    const encodedName = encodeURIComponent(ingredientName);
    if (type === 'Food') {
      return `https://www.google.com/search?q=${encodedName}+in+food`; 
    } else {
      return `https://www.google.com/search?q=${encodedName}+in+cosmetics`; 
    }
  };

  return (
    <div className="mb-8">
      <h3 className={`text-xl font-semibold mb-4 ${isProhibited ? 'text-red-600' : 'text-gray-700'}`}>
        {title}
      </h3>
      <table className="w-full text-left bg-white rounded-lg shadow-md">
        <thead>
          <tr className={isProhibited ? 'bg-red-100' : 'bg-gray-200'}>
            <th className="p-3">Ingredient</th>
            <th className="p-3">Purpose</th>
            <th className="p-3">{isProhibited ? 'Adverse Effects' : dataKey === 'adi' ? 'ADI' : 'Safety Level'}</th>
            <th className="p-3">Details</th>
          </tr>
        </thead>
        <tbody>
          {currentIngredients.map((ingredient, index) => (
            <React.Fragment key={index}>
              <tr className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow(index)}>
                <td className="p-3">
                  <a 
                    href={getIngredientLink(ingredient.name, productType)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:underline"
                  >
                    {ingredient.name}
                  </a>
                </td>
                <td className="p-3">{ingredient.purpose}</td>
                <td className="p-3">{ingredient[dataKey]}</td>
                <td className="p-3">
                  {(ingredient.healthImpact || ingredient.adverseEffects)?.substring(0, 40)}...
                  <span className="text-blue-500 ml-1">{expandedRows[index] ? 'Less' : 'More'}</span>
                </td>
              </tr>
              {expandedRows[index] && (
                <tr className="bg-gray-50">
                  <td colSpan="4" className="p-3 text-gray-600">
                    <strong>Details:</strong> {ingredient.healthImpact || ingredient.adverseEffects}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between items-center">
        <button 
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
        >
          Previous
        </button>
        <span className="text-gray-700">Page {currentPage} of {totalPages || 1}</span>
        <button 
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// -----------------------
// MAIN COMPONENT
// -----------------------
function IngredientsPage() {
  const [foodSearch, setFoodSearch] = useState('');
  const [cosmeticSearch, setCosmeticSearch] = useState('');

  const filteredFoodIngredients = foodIngredients.filter((ing) =>
    ing.name.toLowerCase().includes(foodSearch.toLowerCase())
  );
  const filteredProhibitedFood = prohibitedFoodIngredients.filter((ing) =>
    ing.name.toLowerCase().includes(foodSearch.toLowerCase())
  );
  const filteredCosmeticIngredients = cosmeticIngredients.filter((ing) =>
    ing.name.toLowerCase().includes(cosmeticSearch.toLowerCase())
  );
  const filteredProhibitedCosmetic = prohibitedCosmeticIngredients.filter((ing) =>
    ing.name.toLowerCase().includes(cosmeticSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Ingredient Safety Guide</h1>
      
      <IngredientMatcher />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className="bg-green-50 p-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-semibold text-green-700 mb-4">Packaged Food Ingredients</h2>
          <p className="text-gray-600 mb-6">
            Explore 50 common food additives, their purposes, ADI (Acceptable Daily Intake), and health impacts. Use the matcher tool above to compare your product’s ingredient list.
          </p>
          <input
            type="text"
            placeholder="Search food ingredients..."
            value={foodSearch}
            onChange={(e) => setFoodSearch(e.target.value)}
            className="w-full p-2 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          />
          <IngredientTable 
            ingredients={filteredFoodIngredients} 
            isProhibited={false} 
            title="Common Food Ingredients" 
            dataKey="adi" 
            productType="Food"
          />
          <IngredientTable 
            ingredients={filteredProhibitedFood} 
            isProhibited={true} 
            title="Danger Zone: Unadvisable Food Ingredients" 
            dataKey="adverseEffects" 
            productType="Food"
          />
        </div>
        <div className="bg-blue-50 p-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-semibold text-blue-700 mb-4">Cosmetic Ingredients</h2>
          <p className="text-gray-600 mb-6">
            Discover 50 common cosmetic ingredients, their roles, safety levels, and potential health effects. Use the matcher tool above to check your product’s ingredient list.
          </p>
          <input
            type="text"
            placeholder="Search cosmetic ingredients..."
            value={cosmeticSearch}
            onChange={(e) => setCosmeticSearch(e.target.value)}
            className="w-full p-2 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <IngredientTable 
            ingredients={filteredCosmeticIngredients} 
            isProhibited={false} 
            title="Common Cosmetic Ingredients" 
            dataKey="safetyLevel" 
            productType="Cosmetic"
          />
          <IngredientTable 
            ingredients={filteredProhibitedCosmetic} 
            isProhibited={true} 
            title="Danger Zone: Unadvisable Cosmetic Ingredients" 
            dataKey="adverseEffects" 
            productType="Cosmetic"
          />
        </div>
      </div>
    </div>
  );
}

export default IngredientsPage;