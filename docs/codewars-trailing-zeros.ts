/**
 * Counts trailing zeros in n! for a given base.
 *
 * Algorithm:
 * 1. Factorize the base into prime factors
 * 2. Count how many times each prime appears in n!
 * 3. Divide by the exponent for each prime
 * 4. The minimum is the answer (limiting factor)
 */

// Helper: Get prime factors of a number with their exponents
function getPrimeFactors(n: number): Array<[prime: number, exponent: number]> {
  const factors: Array<[number, number]> = [];

  // Check each prime from 2 up
  for (let prime = 2; prime <= n; prime++) {
    if (n % prime === 0) {
      let exponent = 0;
      // Count how many times this prime divides n
      while (n % prime === 0) {
        n /= prime;
        exponent++;
      }
      factors.push([prime, exponent]);
    }
  }

  return factors;
}

// Helper: Count how many times a prime appears in n!
function countPrimeInFactorial(n: number, prime: number): number {
  let count = 0;
  let power = prime;

  // Count multiples of prime, prime^2, prime^3, etc.
  while (power <= n) {
    count += Math.floor(n / power);
    power *= prime;
  }

  return count;
}

export function zeroes(base: number, num: number): number {
  // Step 1: Factorize the base
  const primeFactors = getPrimeFactors(base);

  // Step 2 & 3: For each prime, count it in num! and divide by exponent
  let minTrailingZeros = Infinity;

  for (const [prime, exponent] of primeFactors) {
    const count = countPrimeInFactorial(num, prime);
    const trailingZeros = Math.floor(count / exponent);

    // Step 4: Take the minimum (limiting factor)
    minTrailingZeros = Math.min(minTrailingZeros, trailingZeros);
  }

  return minTrailingZeros;
}

// Example usage:
// zeroes(10, 10) → 2
// zeroes(16, 16) → 3
// zeroes(144, 10) → works with any base!
