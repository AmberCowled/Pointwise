# Algorithms & Problem-Solving Reference

**Purpose:** Quick reference for Codewars, LeetCode, and algorithm problems  
**Last Updated:** November 2024

---

## Table of Contents

1. [Prime Numbers](#prime-numbers)
2. [Binary Search](#binary-search)
3. [Interval Merging](#interval-merging)
4. [Common Patterns](#common-patterns)
5. [JavaScript/TypeScript Idioms](#javascripttypescript-idioms)
6. [Performance Considerations](#performance-considerations)

---

## Prime Numbers

### Basic Prime Check

**Time Complexity:** O(√n)  
**Space Complexity:** O(1)

```typescript
function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  // Check 6k ± 1 form (all primes > 3 are of this form)
  let i = 5;
  while (i * i <= n) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
    i += 6;
  }
  return true;
}
```

**When to use:**
- Checking if a single number is prime
- Small numbers (n < 10,000)
- One-time checks

### Sieve of Eratosthenes

**Time Complexity:** O(n log log n)  
**Space Complexity:** O(n)

```typescript
export function sieveOfEratosthenes(n: number): number[] {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = false;
  isPrime[1] = false;

  // Mark multiples of primes as false
  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= n; j += i) {
        isPrime[j] = false;
      }
    }
  }

  // Collect all primes
  const primes: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) {
      primes.push(i);
    }
  }

  return primes;
}
```

**When to use:**
- Finding all primes up to n
- Multiple prime checks needed
- n > 10,000 (significantly faster)
- n > 100,000 (essential)

**Performance Comparison:**

| n | Individual Checks | Sieve | Verdict |
|---|------------------|-------|---------|
| 1,000 | ~1ms | ~0.5ms | Either works |
| 10,000 | ~50ms | ~2ms | Sieve 25x faster |
| 100,000 | ~5,000ms | ~20ms | Sieve 250x faster |
| 1,000,000 | Minutes | ~200ms | Sieve only option |

**Optimized Version (Memory Efficient):**

```typescript
export function sieveOfEratosthenesOptimized(n: number): number[] {
  // Use Uint8Array for memory efficiency
  const isPrime = new Uint8Array(n + 1);
  isPrime.fill(1);
  isPrime[0] = 0;
  isPrime[1] = 0;

  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= n; j += i) {
        isPrime[j] = 0;
      }
    }
  }

  const primes: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) {
      primes.push(i);
    }
  }

  return primes;
}
```

---

## Binary Search

### Standard Binary Search

**Time Complexity:** O(log n)  
**Space Complexity:** O(1)

```typescript
export function binarySearch(sortedArray: number[], target: number): number {
  let left = 0;
  let right = sortedArray.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (sortedArray[mid] === target) {
      return mid;
    } else if (sortedArray[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1; // Not found
}
```

**When to use:**
- Array is already sorted
- Multiple searches on same array (sort once, search many)
- Need O(log n) lookup time

### Insert into Sorted Array

**Time Complexity:** O(n) insertion, O(log n) search after

```typescript
export function insertIntoSorted(
  sortedArray: number[],
  value: number,
): number[] {
  // Find insertion point using binary search
  let left = 0;
  let right = sortedArray.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (sortedArray[mid] < value) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  // Insert at position 'left'
  sortedArray.splice(left, 0, value);
  return sortedArray;
}
```

### SortedArray Class

**Use when:** Building array incrementally AND searching many times

```typescript
class SortedArray<T> {
  private arr: T[] = [];

  constructor(
    private compareFn: (a: T, b: T) => number = (a, b) =>
      a < b ? -1 : a > b ? 1 : 0,
  ) {}

  // O(n) - must find insertion point and shift elements
  insert(value: T): void {
    let left = 0;
    let right = this.arr.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.compareFn(this.arr[mid], value) < 0) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    this.arr.splice(left, 0, value);
  }

  // O(log n) - binary search
  search(target: T): number {
    let left = 0;
    let right = this.arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = this.compareFn(this.arr[mid], target);
      if (comparison === 0) {
        return mid;
      } else if (comparison < 0) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return -1;
  }

  get(index: number): T {
    return this.arr[index];
  }

  toArray(): T[] {
    return [...this.arr];
  }
}
```

**When to use each approach:**

1. **Linear search (O(n)):**
   - Small arrays (< 100 items)
   - Only searching once
   - Array is unsorted and won't be sorted

2. **Sort then binary search:**
   - O(n log n) to sort + O(log n) per search
   - Worth it if: searching multiple times
   - Example: Array of 1000 items, searching 100 times
     - Linear: 1000 × 100 = 100,000 operations
     - Sort + Binary: 1000×log(1000) + 100×log(1000) ≈ 11,000 operations

3. **SortedArray (maintain sorted order):**
   - O(n) per insert + O(log n) per search
   - Worth it if: Building array incrementally AND searching many times

4. **Set/Map (O(1) average lookup):**
   - Best for: Exact matches, no ordering needed
   - Example: Checking if item exists, counting occurrences

---

## Interval Merging

### IntervalList Class

**Use case:** Merge overlapping intervals, calculate sum of intervals

```typescript
type Interval = {
  low: number;
  high: number;
};

type IntervalInsertionIndex = {
  index: number;
  overlaps: boolean;
};

class IntervalList {
  private list: Interval[] = [];

  // Binary search to find insertion point or overlapping interval
  private findInsertionIndex(interval: Interval): IntervalInsertionIndex {
    let low = 0;
    let high = this.list.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const guess = this.list[mid];
      
      // Check overlap: !(a.high < b.low || b.high < a.low)
      if (!(interval.high < guess.low || guess.high < interval.low)) {
        return { index: mid, overlaps: true };
      }
      
      if (interval.low < guess.low) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return { index: low, overlaps: false };
  }

  public get intervals(): Interval[] {
    return [...this.list]; // Return copy to prevent mutation
  }

  public insertInterval(interval: Interval): void {
    // Auto-correct invalid intervals
    if (interval.low > interval.high) {
      interval = { low: interval.high, high: interval.low };
    }

    const insertionIndex = this.findInsertionIndex(interval);
    
    if (insertionIndex.overlaps) {
      // Combine with overlapping interval
      const combinedInterval = this.combineInterval(
        interval,
        this.list[insertionIndex.index],
      );

      // Remove overlapping interval
      this.list.splice(insertionIndex.index, 1);

      // Recursively handle cascading overlaps
      this.insertInterval(combinedInterval);
    } else {
      // Insert at correct position
      this.list.splice(insertionIndex.index, 0, interval);
    }
  }

  public insert(interval: [number, number]): void {
    this.insertInterval({ low: interval[0], high: interval[1] });
  }

  private combineInterval(a: Interval, b: Interval): Interval {
    return {
      low: Math.min(a.low, b.low),
      high: Math.max(a.high, b.high),
    };
  }
}

// Example: Sum of intervals
export function sumOfIntervals(intervals: [number, number][]): number {
  const intervalsList = new IntervalList();

  for (const interval of intervals) {
    intervalsList.insert(interval);
  }

  return intervalsList.intervals.reduce(
    (sum, interval) => sum + (interval.high - interval.low),
    0,
  );
}
```

**Key Concepts:**
- **Overlap condition:** `!(a.high < b.low || b.high < a.low)`
- **Binary search** for O(log n) insertion point finding
- **Recursive merging** handles cascading overlaps
- **Auto-correction** for invalid intervals (low > high)

---

## Common Patterns

### Two Pointers

**Use case:** Sorted arrays, finding pairs, removing duplicates

```typescript
// Example: Remove duplicates from sorted array
function removeDuplicates(nums: number[]): number {
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1;
}

// Example: Find two numbers that sum to target
function twoSum(sortedArray: number[], target: number): [number, number] | null {
  let left = 0;
  let right = sortedArray.length - 1;

  while (left < right) {
    const sum = sortedArray[left] + sortedArray[right];
    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return null;
}
```

### Sliding Window

**Use case:** Subarrays, substrings, consecutive elements

```typescript
// Example: Maximum sum of subarray of size k
function maxSumSubarray(arr: number[], k: number): number {
  let windowSum = 0;
  let maxSum = 0;

  // Initialize first window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;

  // Slide window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i];
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}
```

### Frequency Counting

**Use case:** Character/word frequency, anagrams, duplicates

```typescript
// Using Map (best for large datasets)
function countFrequency(arr: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const item of arr) {
    freq.set(item, (freq.get(item) || 0) + 1);
  }
  return freq;
}

// Using object (simpler, fine for small datasets)
function countFrequencyObject(arr: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const item of arr) {
    freq[item] = (freq[item] || 0) + 1;
  }
  return freq;
}
```

### Stack/Queue Patterns

**Use case:** Matching parentheses, BFS/DFS, monotonic stacks

```typescript
// Example: Valid parentheses
function isValidParentheses(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    '}': '{',
    ']': '[',
  };

  for (const char of s) {
    if (char in pairs) {
      if (stack.length === 0 || stack.pop() !== pairs[char]) {
        return false;
      }
    } else {
      stack.push(char);
    }
  }

  return stack.length === 0;
}
```

---

## JavaScript/TypeScript Idioms

### Array Methods

**Common patterns for Codewars:**

```typescript
// Extract digits from number
const digits = n.toString().split('').map(Number);
// or: Array.from(String(n), Number)

// Sum of array
const sum = arr.reduce((acc, val) => acc + val, 0);

// Count occurrences
const count = arr.filter(x => x === target).length;
// or: arr.reduce((acc, x) => acc + (x === target ? 1 : 0), 0)

// Find min/max
const min = Math.min(...arr);
const max = Math.max(...arr);
// For large arrays, use: arr.reduce((min, x) => Math.min(min, x), arr[0])

// Reverse string
const reversed = str.split('').reverse().join('');

// Remove duplicates
const unique = [...new Set(arr)];

// Group by property
const grouped = arr.reduce((acc, item) => {
  const key = item.category;
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;
}, {} as Record<string, typeof arr>);
```

### String Manipulation

```typescript
// Character to number (a=1, b=2, etc.)
const charToNum = (char: string): number => char.charCodeAt(0) - 96;

// Number to character
const numToChar = (num: number): string => String.fromCharCode(num + 96);

// Extract only letters
const letters = str.replace(/[^a-z]/gi, '').toLowerCase();

// Split by multiple delimiters
const parts = str.split(/[\s,;]+/);

// Pad with zeros
const padded = num.toString().padStart(4, '0'); // "5" -> "0005"
```

### Number Operations

```typescript
// Digital root (recursive sum of digits)
function digitalRoot(n: number): number {
  while (n >= 10) {
    n = n.toString().split('').map(Number).reduce((sum, d) => sum + d, 0);
  }
  return n;
}

// Count bits in binary representation
function countBits(n: number): number {
  return n.toString(2).replace(/0/g, '').length;
  // or: n.toString(2).split('').filter(b => b === '1').length
}

// Check if number is power of 2
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

// Greatest common divisor (GCD)
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// Least common multiple (LCM)
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}
```

### Mathematical Formulas

```typescript
// Sum of integers from 1 to n
const sum1ToN = (n: number): number => (n * (n + 1)) / 2;

// Sum of integers from a to b
const sumAtoB = (a: number, b: number): number => {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return ((max - min + 1) * (min + max)) / 2;
};

// Sum of squares: 1² + 2² + ... + n²
const sumOfSquares = (n: number): number => (n * (n + 1) * (2 * n + 1)) / 6;

// Sum of cubes: 1³ + 2³ + ... + n³
const sumOfCubes = (n: number): number => ((n * (n + 1)) / 2) ** 2;
```

---

## Performance Considerations

### When to Optimize

**Don't optimize prematurely, but consider:**

1. **Array operations:**
   - `slice()` creates a copy - avoid in loops
   - `splice()` is O(n) - expensive for large arrays
   - `reduce()` vs `for` loop: `reduce` is cleaner but slightly slower

2. **String operations:**
   - `substring()` vs `slice()`: `slice()` is generally preferred
   - `split('')` creates array - use `charAt()` for single character access
   - Regex can be slow - use string methods when possible

3. **Object vs Map:**
   - **Object:** Simple, fine for < 100 keys
   - **Map:** Better for dynamic keys, large datasets, key iteration

4. **Set vs Array:**
   - **Set:** O(1) lookup, O(1) insertion (average)
   - **Array:** O(n) lookup, O(1) push
   - Use Set for: uniqueness checks, fast lookups

### Big O Cheat Sheet

| Operation | Array | Set | Map | Object |
|-----------|-------|-----|-----|--------|
| Lookup | O(n) | O(1) | O(1) | O(1) |
| Insert | O(1) | O(1) | O(1) | O(1) |
| Delete | O(n) | O(1) | O(1) | O(1) |
| Iterate | O(n) | O(n) | O(n) | O(n) |

### Common Pitfalls

1. **Nested loops:** O(n²) - look for two-pointer or hash map solutions
2. **Repeated calculations:** Cache results (memoization)
3. **String concatenation in loops:** Use array + `join()` instead
4. **Unnecessary array copies:** Use indices when possible
5. **Missing initial value in reduce:** Always provide initial value for type safety

---

## Problem-Solving Checklist

1. **Understand the problem:**
   - Read carefully (read 2-3 times!)
   - Identify edge cases
   - Clarify requirements

2. **Choose approach:**
   - Brute force first (if time allows)
   - Identify patterns (two pointers, sliding window, etc.)
   - Consider data structures (Set, Map, Stack, Queue)

3. **Implement:**
   - Start with clear variable names
   - Add comments for complex logic
   - Test edge cases

4. **Optimize:**
   - Check time/space complexity
   - Look for redundant operations
   - Consider alternative data structures

5. **Test:**
   - Edge cases (empty array, single element, large input)
   - Boundary conditions
   - Invalid inputs

---

## Quick Reference: Common Codewars Patterns

### String Problems
- **Anagrams:** Sort characters, compare
- **Palindromes:** Two pointers from ends
- **Character frequency:** Map or object
- **Substring search:** Sliding window

### Array Problems
- **Two sum:** Hash map (O(n)) or two pointers if sorted (O(n log n))
- **Maximum subarray:** Kadane's algorithm
- **Rotations:** Reverse technique
- **Duplicates:** Set or sort + compare adjacent

### Number Problems
- **Prime checks:** Sieve for multiple, optimized check for single
- **Digit manipulation:** `toString().split('').map(Number)`
- **Base conversion:** `toString(base)` and `parseInt(str, base)`
- **Modular arithmetic:** `(a % b + b) % b` for negative-safe modulo

---

## Notes

- **Practice regularly:** 1-2 problems per day
- **Read solutions:** Learn different approaches
- **Understand, don't memorize:** Know WHY solutions work
- **Time yourself:** Practice under constraints
- **Review patterns:** Common patterns appear frequently

**Remember:** The goal is to recognize patterns and apply appropriate algorithms, not to memorize solutions!

