const recipes = [
  // --- 基础物质 ---
  { id: 'water', name: '水', formula: 'H₂O', required: { H: 2, O: 1 }, desc: '生命之源，宇宙中最纯净的极性溶剂。', use: ['维持生命运转', '溶剂', '饮料'] },
  { id: 'co2', name: '二氧化碳', formula: 'CO₂', required: { C: 1, O: 2 }, desc: '植物呼吸的原料，干冰状态下能产生仙境迷雾。', use: ['光合作用', '灭火器', '碳酸饮料'] },

  // --- 11-20 号元素衍生物质 (核心扩充) ---
  { id: 'nacl', name: '氯化钠 (食盐)', formula: 'NaCl', required: { Na: 1, Cl: 1 }, desc: '海洋的结晶，维持生物神经传导的必备电解质。', use: ['厨房调味品', '医疗生理盐水'] },
  { id: 'hcl', name: '氯化氢 (盐酸)', formula: 'HCl', required: { H: 1, Cl: 1 }, desc: '极具刺激性的酸性气体，溶于水后化身工业强酸。', use: ['胃酸主要成分', '金属除锈剂'] },
  { id: 'mgo', name: '氧化镁', formula: 'MgO', required: { Mg: 1, O: 1 }, desc: '耀眼白光爆燃后留下的纯白粉末，极其耐高温。', use: ['耐火材料', '体操运动员防滑粉'] },
  { id: 'al2o3', name: '氧化铝', formula: 'Al₂O₃', required: { Al: 2, O: 3 }, desc: '红宝石与蓝宝石的真身，硬度极高的致密装甲。', use: ['人造蓝宝石', '金属防腐蚀保护膜'] },
  { id: 'sio2', name: '二氧化硅', formula: 'SiO₂', required: { Si: 1, O: 2 }, desc: '沙子和天然水晶的灵魂，构建现代半导体帝国的基石。', use: ['光导纤维', '石英玻璃制造'] },
  { id: 'p2o5', name: '五氧化二磷', formula: 'P₂O₅', required: { P: 2, O: 5 }, desc: '红磷剧烈燃烧产生的浓郁白烟，极度嗜水。', use: ['强效实验室干燥剂', '军用烟幕弹'] },
  { id: 'so2', name: '二氧化硫', formula: 'SO₂', required: { S: 1, O: 2 }, desc: '火山喷发时的刺鼻气体，带有强烈的漂白与杀菌魔力。', use: ['工业漂白剂', '葡萄酒防腐'] },
  { id: 'kcl', name: '氯化钾', formula: 'KCl', required: { K: 1, Cl: 1 }, desc: '植物生长的能量补给，生命心脏跳动的幕后推手。', use: ['农业高效钾肥', '健康低钠盐'] },
  { id: 'cao', name: '氧化钙 (生石灰)', formula: 'CaO', required: { Ca: 1, O: 1 }, desc: '洁白狂躁的石块，遇水瞬间沸腾并释放巨大热量。', use: ['建筑材料', '自热火锅发热包核心'] },
  { id: 'caco3', name: '碳酸钙', formula: 'CaCO₃', required: { Ca: 1, C: 1, O: 3 }, desc: '坚硬珊瑚与大理石的骨架，跨越千万年的地质沉积物。', use: ['优质建筑石材', '补钙含片制剂'] }
];

export default recipes;
