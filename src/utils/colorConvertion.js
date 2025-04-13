export const hexToColorName = (hex) => {
  const normalizedHex = hex.toUpperCase();
  
  // Map of common hex color codes to their names
  const colorMap = {
    "#000000": "Black",
    "#FFFFFF": "White",
    "#FF0000": "Red",
    "#00FF00": "Green",
    "#0000FF": "Blue",
    "#FFFF00": "Yellow",
    "#00FFFF": "Cyan",
    "#FF00FF": "Magenta",
    "#C0C0C0": "Silver",
    "#808080": "Gray",
    "#800000": "Maroon",
    "#808000": "Olive",
    "#008000": "Dark Green",
    "#800080": "Purple",
    "#008080": "Teal",
    "#000080": "Navy",
    "#FFA500": "Orange",
    "#8B4513": "Brown",
    "#FFC0CB": "Pink",
    "#F5F5DC": "Beige",
    "#FFD700": "Gold",
    "#999999": "Gray",
    "#AF8942": "Tan/Khaki",
  };
  
  return colorMap[normalizedHex] || hex;
};