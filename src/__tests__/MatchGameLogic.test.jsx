import { describe, it, expect } from 'vitest';

describe('MatchGame 核心逻辑防御测试', () => {

  describe('A: 发牌函数 - uniqueId 唯一性', () => {
    const generateCardsForLevel1to4 = (elements) => {
      const generatedCards = [];
      elements.forEach((element) => {
        const rnd = Math.random().toString(36).substring(2, 9);
        generatedCards.push({
          uniqueId: `${element.id}-key1-${rnd}`,
          elementId: element.id,
          displayValue: element.symbol,
          type: 'key1',
          selected: false,
          matched: false
        });
        generatedCards.push({
          uniqueId: `${element.id}-key2-${rnd}`,
          elementId: element.id,
          displayValue: element.valence,
          type: 'key2',
          selected: false,
          matched: false
        });
      });
      return generatedCards;
    };

    const generateCardsForLevel5plus = (elements) => {
      const generatedCards = [];
      elements.forEach((element) => {
        const anchorType = 'symbol';
        const rnd = Math.random().toString(36).substring(2, 9);
        generatedCards.push({
          uniqueId: `${element.id}-anchor-${anchorType}-${rnd}`,
          elementId: element.id,
          displayValue: element.symbol,
          type: 'anchor'
        });
        generatedCards.push({
          uniqueId: `${element.id}-numeric-valence-${rnd}`,
          elementId: element.id,
          displayValue: element.valence,
          type: 'numeric'
        });
      });
      return generatedCards;
    };

    it('当抽到两个相同元素(H)时，4张卡片的uniqueId应完全不重复', () => {
      const H = { id: 1, symbol: 'H', name: '氢', valence: '+1' };
      const elements = [H, H];
      const cards = generateCardsForLevel1to4(elements);

      expect(cards).toHaveLength(4);

      const ids = cards.map(c => c.uniqueId);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(4);
    });

    it('当抽到三个相同元素(Na)时，6张卡片的uniqueId应完全不重复', () => {
      const Na = { id: 11, symbol: 'Na', name: '钠', valence: '+1' };
      const elements = [Na, Na, Na];
      const cards = generateCardsForLevel1to4(elements);

      expect(cards).toHaveLength(6);

      const ids = cards.map(c => c.uniqueId);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(6);
    });

    it('不同元素混合时所有卡片uniqueId也应唯一', () => {
      const H = { id: 1, symbol: 'H', valence: '+1' };
      const O = { id: 8, symbol: 'O', valence: '-2' };
      const Na = { id: 11, symbol: 'Na', valence: '+1' };
      const Cl = { id: 17, symbol: 'Cl', valence: '-1,+1,+5,+7' };

      const elements = [H, O, Na, Cl, H, O];
      const cards = generateCardsForLevel1to4(elements);

      expect(cards).toHaveLength(12);

      const ids = cards.map(c => c.uniqueId);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(12);
    });

    it('Level 5+ 模式下重复元素也应生成唯一ID', () => {
      const C = { id: 6, symbol: 'C', valence: '+2,+4' };
      const N = { id: 7, symbol: 'N', valence: '-3,+2,+4,+5' };
      const elements = [C, C, N];

      const cards = generateCardsForLevel5plus(elements);

      expect(cards).toHaveLength(6);

      const ids = cards.map(c => c.uniqueId);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(6);
    });

    it('大量重复元素(压力测试)仍保证唯一性', () => {
      const Fe = { id: 26, symbol: 'Fe', valence: '+2,+3' };
      const elements = Array(20).fill(null).map(() => ({ ...Fe }));

      const cards = generateCardsForLevel1to4(elements);

      expect(cards).toHaveLength(40);

      const ids = cards.map(c => c.uniqueId);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(40);
    });

    it('每张卡片的uniqueId格式应包含随机后缀', () => {
      const H = { id: 1, symbol: 'H', valence: '+1' };
      const cards = generateCardsForLevel1to4([H]);

      cards.forEach(card => {
        expect(card.uniqueId).toMatch(/^\d+-key[12]-[a-z0-9]{7}$/);
      });
    });
  });

  describe('B: 星级评定算法 - 边界值测试', () => {
    const calculateStars = (waveUsedTime, hasErrors, isFirstPass) => {
      let earnedStars = 1;
      if (!hasErrors) {
        earnedStars = 2;
        if (waveUsedTime <= 15 && isFirstPass) {
          earnedStars = 3;
        }
      }
      return earnedStars;
    };

    it('有错误 → 1星（最差情况）', () => {
      expect(calculateStars(10, true, true)).toBe(1);
      expect(calculateStars(60, true, false)).toBe(1);
      expect(calculateStars(100, true, false)).toBe(1);
    });

    it('无错误 + 超过15秒 或 非首次通过 → 2星', () => {
      expect(calculateStars(16, false, true)).toBe(2);
      expect(calculateStars(30, false, true)).toBe(2);
      expect(calculateStars(15, false, false)).toBe(2);
      expect(calculateStars(10, false, false)).toBe(2);
    });

    it('无错误 + ≤15秒 + 首次通过 → 3星（完美通关）', () => {
      expect(calculateStars(0, false, true)).toBe(3);
      expect(calculateStars(10, false, true)).toBe(3);
      expect(calculateStars(15, false, true)).toBe(3);
    });

    it('边界值: 15秒整是3星的临界点', () => {
      expect(calculateStars(15, false, true)).toBe(3);
      expect(calculateStars(16, false, true)).toBe(2);
    });

    it('边界值: 有任何错误就降为1星（即使速度很快）', () => {
      expect(calculateStars(5, true, true)).toBe(1);
      expect(calculateStars(1, true, true)).toBe(1);
    });

    it('星级范围严格在 [1, 3] 内', () => {
      for (let t = 0; t <= 120; t += 5) {
        for (const hasErr of [true, false]) {
          for (const first of [true, false]) {
            const stars = calculateStars(t, hasErr, first);
            expect(stars).toBeGreaterThanOrEqual(1);
            expect(stars).toBeLessThanOrEqual(3);
          }
        }
      }
    });
  });
});
