// src/utils/dataUtils.js

import { capitals} from '../data/site2.js'; // 引入数据和配置
import cities from '../data/region_centers.json';

export const allMaxPLValues = capitals.map(capital => {
  return Math.max(...Object.values(capital.PL));
});

export const globalMaxPLValue = Math.max(...allMaxPLValues);

export const filteredCapitals = capitals.filter(capital => {
    // 检查是否匹配 province, city 或 district
    return capital.province ===cities[0].name || 
           capital.city ===cities[0].name || 
           capital.district ===cities[0].name;
  });
