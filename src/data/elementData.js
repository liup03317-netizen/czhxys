const elementData = [
  {
    id: 1,
    symbol: "H",
    name: "氢",
    pinyin: "qīng",
    atomicNumber: 1,
    atomicMass: 1.01,
    valence: "+1",
    mnemonic: "1号氢气最最轻，火箭上天它显形。",
    visualConcept: "透明果冻感的水滴，中心包裹一个微缩的发射火箭，周围有淡蓝色光晕。",
    commonUse: "火箭燃料、合成水"
  },
  {
    id: 2,
    symbol: "He",
    name: "氦",
    pinyin: "hài",
    atomicNumber: 2,
    atomicMass: 4.00,
    valence: "0",
    mnemonic: "2号氦气飘气球，高冷稳定不回头。",
    visualConcept: "圆润的哑光彩色气球，悬浮感十足，背景是轻盈的云朵纹理。",
    commonUse: "飞艇、彩色气球"
  },
  {
    id: 3,
    symbol: "Li",
    name: "锂",
    pinyin: "lǐ",
    atomicNumber: 3,
    atomicMass: 6.94,
    valence: "+1",
    mnemonic: "3号锂电能量强，手机电脑它最忙。",
    visualConcept: "银白色的粘土方块，侧面带有闪电图标，发散出青色的电流粒子。",
    commonUse: "锂电池、航空合金"
  },
  {
    id: 4,
    symbol: "Be",
    name: "铍",
    pinyin: "pí",
    atomicNumber: 4,
    atomicMass: 9.01,
    valence: "+2",
    mnemonic: "铍做镜面透X光，反射清晰亮堂堂。",
    visualConcept: "光滑的金属镜面，边缘泛着银白色光泽，能完美反射光线。",
    commonUse: "X射线窗口、航天材料"
  },
  {
    id: 5,
    symbol: "B",
    name: "硼",
    pinyin: "péng",
    atomicNumber: 5,
    atomicMass: 10.81,
    valence: "+3",
    mnemonic: "5号硼在玻璃里，耐热抗摔显神力。",
    visualConcept: "一摞整齐的透明玻璃板，边缘闪烁着实验室的冷光。",
    commonUse: "耐热玻璃、眼药水"
  },
  {
    id: 6,
    symbol: "C",
    name: "碳",
    pinyin: "tàn",
    atomicNumber: 6,
    atomicMass: 12.01,
    valence: "+2, +4",
    mnemonic: "6号碳变黑金刚，铅笔钻石一母装。",
    visualConcept: "黑灰色的哑光铅笔芯，斜切面呈现出耀眼的钻石折射感。",
    commonUse: "铅笔、钻石、燃料"
  },
  {
    id: 7,
    symbol: "N",
    name: "氮",
    pinyin: "dàn",
    atomicNumber: 7,
    atomicMass: 14.01,
    valence: "-3, +2, +4, +5",
    mnemonic: "7号氮气保新鲜，零下两百变冰仙。",
    visualConcept: "一袋膨胀的膨化食品包装，周围萦绕着液氮喷射出的白色冷雾。",
    commonUse: "食品防腐、超导冷却"
  },
  {
    id: 8,
    symbol: "O",
    name: "氧",
    pinyin: "yǎng",
    atomicNumber: 8,
    atomicMass: 16.00,
    valence: "-2",
    mnemonic: "8号氧气生命源，呼吸燃烧它在前。",
    visualConcept: "一个复古的亮色氧气罐，周围环绕着象征生命的嫩绿色叶片。",
    commonUse: "医疗急救、助燃剂"
  },
  {
    id: 9,
    symbol: "F",
    name: "氟",
    pinyin: "fú",
    atomicNumber: 9,
    atomicMass: 19.00,
    valence: "-1",
    mnemonic: "9号氟在牙膏里，坚固牙齿没压力。",
    visualConcept: "一管像软糖一样Q弹的粘土牙膏，挤出的部分像白云一样蓬松。",
    commonUse: "防龋齿牙膏、特氟龙"
  },
  {
    id: 10,
    symbol: "Ne",
    name: "氖",
    pinyin: "nǎi",
    atomicNumber: 10,
    atomicMass: 20.18,
    valence: "0",
    mnemonic: "10号氖气霓虹灯，五彩斑斓照进城。",
    visualConcept: "弯曲成N字母的霓虹灯管，发出高饱和度的粉紫色荧光。",
    commonUse: "霓虹灯、激光技术"
  },
  {
    id: 11,
    symbol: "Na",
    name: "钠",
    pinyin: "nà",
    atomicNumber: 11,
    atomicMass: 22.99,
    valence: "+1",
    mnemonic: "钠在海里变食盐，+1价态最常见。",
    visualConcept: "纯白色的哑光盐立方体，旁边是一朵激起的Q版蓝色粘土浪花。",
    commonUse: "食盐、钠灯"
  },
  {
    id: 12,
    symbol: "Mg",
    name: "镁",
    pinyin: "měi",
    atomicNumber: 12,
    atomicMass: 24.31,
    valence: "+2",
    mnemonic: "镁条燃烧白光亮，烟花摄影全靠它。",
    visualConcept: "复古相机镜头，前方爆裂开一团极度纯净的白色粘土发光云。",
    commonUse: "烟花、相机闪光灯"
  },
  {
    id: 13,
    symbol: "Al",
    name: "铝",
    pinyin: "lǚ",
    atomicNumber: 13,
    atomicMass: 26.98,
    valence: "+3",
    mnemonic: "铝做罐头和飞机，轻便耐腐没压力。",
    visualConcept: "银灰色的金属质感易拉罐，背景有一对轻盈的机翼剪影。",
    commonUse: "易拉罐、航空材料"
  },
  {
    id: 14,
    symbol: "Si",
    name: "硅",
    pinyin: "guī",
    atomicNumber: 14,
    atomicMass: 28.09,
    valence: "+4",
    mnemonic: "硅是电脑心脏芯，沙里藏着亮晶晶。",
    visualConcept: "半透明的幽蓝色芯片，中心微缩显示出细腻的白沙纹理。",
    commonUse: "半导体芯片、玻璃原料"
  },
  {
    id: 15,
    symbol: "P",
    name: "磷",
    pinyin: "lín",
    atomicNumber: 15,
    atomicMass: 30.97,
    valence: "-3, +3, +5",
    mnemonic: "磷遇空气燃烈火，火柴头上一抹红。",
    visualConcept: "一簇跳动的橙红色火焰，光芒四射，中心温度极高。",
    commonUse: "火柴、化肥、燃烧弹"
  },
  {
    id: 16,
    symbol: "S",
    name: "硫",
    pinyin: "liú",
    atomicNumber: 16,
    atomicMass: 32.07,
    valence: "-2, +4, +6",
    mnemonic: "硫磺火药火山味，黄色粉末最纯粹。",
    visualConcept: "一座喷发黄色烟雾的粘土火山，山脚堆满鲜亮的亮黄色粉末。",
    commonUse: "黑火药、硫酸生产"
  },
  {
    id: 17,
    symbol: "Cl",
    name: "氯",
    pinyin: "lǜ",
    atomicNumber: 17,
    atomicMass: 35.45,
    valence: "-1, +1, +5, +7",
    mnemonic: "氯气消毒泳池清，食盐里头它显形。",
    visualConcept: "一个极简的正方形清澈泳池，池水微显青绿色，漂浮着消毒片。",
    commonUse: "自来水消毒、食盐"
  },
  {
    id: 18,
    symbol: "Ar",
    name: "氩",
    pinyin: "yà",
    atomicNumber: 18,
    atomicMass: 39.95,
    valence: "0",
    mnemonic: "氩气灯泡保长命，焊接保护显神功。",
    visualConcept: "一个巨大的爱迪生灯泡，内部灯丝呈现出稳定的原子轨道发光。",
    commonUse: "灯泡填充气、焊接保护"
  },
  {
    id: 19,
    symbol: "K",
    name: "钾",
    pinyin: "jiǎ",
    atomicNumber: 19,
    atomicMass: 39.10,
    valence: "+1",
    mnemonic: "钾肥香蕉能量果，草木灰里常出没。",
    visualConcept: "一串极度圆润的亮黄色粘土香蕉，周围环绕着紫色的能量电波。",
    commonUse: "钾肥、维持心跳"
  },
  {
    id: 20,
    symbol: "Ca",
    name: "钙",
    pinyin: "gài",
    atomicNumber: 20,
    atomicMass: 40.08,
    valence: "+2",
    mnemonic: "贝壳海里藏碳酸钙，骨骼牙齿它主宰。",
    visualConcept: "一只精致的白色扇贝，表面有天然的螺旋纹路，泛着珍珠光泽。",
    commonUse: "骨骼发育、建筑材料、海洋生物"
  }
];

export default elementData;

export const getDisplayAtomicMass = (symbol) => {
  const element = elementData.find(el => el.symbol === symbol);
  if (!element) return '';
  
  const mass = element.atomicMass;
  if (mass % 1 !== 0) {
    return mass.toFixed(2);
  }
  return mass.toString();
};
