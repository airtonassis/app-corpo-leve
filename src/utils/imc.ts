import { ResultadoImc } from '../types';

/**
 * Calcula o IMC (Índice de Massa Corporal) e retorna a classificação.
 * Fórmula: peso (kg) / altura (m)²
 */
export function calcularImc(pesoKg: number, alturaCm: number): ResultadoImc {
  if (!pesoKg || !alturaCm) {
    return { valor: 0, classificacao: 'Dados insuficientes' };
  }

  const alturaM = alturaCm / 100;
  const valor = pesoKg / (alturaM * alturaM);
  const valorArredondado = Math.round(valor * 10) / 10;

  return {
    valor: valorArredondado,
    classificacao: classificarImc(valorArredondado),
  };
}

function classificarImc(imc: number): string {
  if (imc <= 0) return 'Dados insuficientes';
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Peso adequado';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidade grau I';
  if (imc < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
}

/**
 * Retorna uma mensagem de contexto acolhedora para a classificação,
 * sem julgamento — alinhada ao tom do app.
 */
export function mensagemContextoImc(classificacao: string): string {
  switch (classificacao) {
    case 'Abaixo do peso':
      return 'Seu foco pode ser ganhar força e massa muscular com progressão gradual.';
    case 'Peso adequado':
      return 'Ótimo ponto de partida para evoluir em força e resistência.';
    case 'Sobrepeso':
    case 'Obesidade grau I':
    case 'Obesidade grau II':
    case 'Obesidade grau III':
      return 'A calistenia vai te ajudar a ganhar força e condicionamento no seu ritmo.';
    default:
      return 'Preencha seus dados para acompanhar sua evolução.';
  }
}
