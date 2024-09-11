// createPieSeries.js

export function createPieSeries(capitals, globalMaxPLValue) {
    const pieSeries = [];
  
    capitals.forEach(capital => {
      pieSeries.push({
        type: 'custom',
        name: capital.site,
        coordinateSystem: 'amap',
        center: capital.center, // 使用每个 capital 的中心作为坐标
        renderItem: (params, api) => {
          const layout = api.coord(capital.center); // 计算中心位置
          const size = 32; // 主矩形的大小
          return {
            type: 'group',
            children: [
              // 主矩形
              {
                type: 'rect',
                shape: {
                  x: layout[0] - size / 2,
                  y: layout[1] - size / 2,
                  width: size,
                  height: size
                },
                style: {
                  fill: 'none',
                  stroke: '#000'
                }
              },
              // 小矩形，根据 PL 的值动态生成
              ...Object.values(capital.PL).map((value, index) => {
                const radius = 8; // 扇形的半径
                const lineWidth = 0; // 扇形的线宽
                const centerX = layout[0]; // 圆心的 X 坐标
                const centerY = layout[1]; // 圆心的 Y 坐标
  
                // Function to calculate the end angle based on PL value
                const getEndAngle = (value, globalMaxPLValue) => {
                  // Calculate the progress as a fraction of the full circle
                  const progress = value / globalMaxPLValue;
                  // Return the end angle in radians
                  return 2 * Math.PI * progress;
                };
  
                const endAngle = getEndAngle(value, globalMaxPLValue);
  
                // Determine the position of the fan shapes
                const positions = [
                  { x: centerX - radius, y: centerY - radius }, // 左上
                  { x: centerX + radius, y: centerY - radius }, // 右上
                  { x: centerX - radius, y: centerY + radius }, // 左下
                  { x: centerX + radius, y: centerY + radius } // 右下
                ];
  
                return {
                  type: 'arc',
                  shape: {
                    cx: positions[index].x, // 圆心 X 坐标
                    cy: positions[index].y, // 圆心 Y 坐标
                    r: radius,
                    startAngle: -Math.PI / 2,
                    endAngle: endAngle - Math.PI / 2
                  },
                  style: {
                    stroke: 'red',
                    lineWidth: lineWidth,
                    fill: 'rgba(255, 0, 0, 1)' // 填充红色
                  }
                };
              })
            ]
          };
        },
        data: [{
          value: mean(
            capital.PL.PL_1 || 0,
            capital.PL.PL_2 || 0,
            capital.PL.PL_3 || 0,
            capital.PL.PL_4 || 0
          )
        }] // 所有中心点的位置
      });
    });
  
    return pieSeries;
  }
  
  function mean(...values) {
    const sum = values.reduce((total, value) => total + value, 0);
    return sum / values.length;
  }
  