import { useWindowDimensions } from 'react-native';

/**
 * Hook central de responsividade — Melhoria 5.
 * Fornece breakpoints simples e um "scale" para fontes/paddings,
 * evitando telas quebradas em celulares pequenos, grandes ou tablets,
 * tanto em Android quanto em iOS.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < 360; // ex: iPhone SE
  const isPhone = width >= 360 && width < 600;
  const isTablet = width >= 600;
  const isLandscape = width > height;

  // fator de escala simples para textos/paddings em telas pequenas
  const scale = isSmallPhone ? 0.92 : isTablet ? 1.1 : 1;

  // número de colunas sugerido para grids (ex: lista de exercícios com imagem)
  const colunas = isTablet ? (isLandscape ? 3 : 2) : 1;

  // largura máxima de conteúdo para não esticar demais em tablets
  const maxContentWidth = isTablet ? 720 : undefined;

  return { width, height, isSmallPhone, isPhone, isTablet, isLandscape, scale, colunas, maxContentWidth };
}
