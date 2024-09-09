import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import 'echarts-extension-amap';
import AMapLoader from '@amap/amap-jsapi-loader';

const MapChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return; // Check if chartRef.current exists

    AMapLoader.load({
      key: '514c99148afec38a187b745ddbd1e517', // Your AMap API key
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar'],
    }).then(AMap => {
      const chart = echarts.init(chartRef.current);

      const data = {
        '北京': [10, 20, 30, 40],
        '攀枝花': [15, 20, 36, 42],
        '开封': [17, 42, 15, 31],
        '上海': [46, 50, 59, 80],
        '广州': [90, 45, 36, 15]
      };

      const geoCoords = {
        '北京': [116.46, 39.92],
        '攀枝花': [101.718637, 26.582347],
        '开封': [114.35, 34.79],
        '上海': [121.48, 31.22],
        '广州': [113.23, 23.16]
      };

      const pieDimensions = ['A', 'B', 'C', 'D'];
      const pieSeries = [];

      echarts.util.each(data, (values, name) => {
        pieSeries.push({
          type: 'pie',
          name: name,
          coordinateSystem: 'amap',
          center: geoCoords[name],
          radius: 20,
          data: echarts.util.map(values, (value, idx) => ({
            name: pieDimensions[idx],
            value: value
          })),
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true
            },
            labelLine: {
              show: true,
              lineStyle: {
                color: '#fff'
              }
            }
          }
        });
      });

      const option = {
        amap: {
          viewMode: '3D',
          center: [222.278269, 35.391011],
          zoom: 4,
          resizeEnable: true,
          mapStyle: 'amap://styles/dark',
          renderOnMoving: true,
          echartsLayerZIndex: 2000,
          echartsLayerInteractive: true,
          largeMode: false
        },
        tooltip: {
          trigger: 'item'
        },
        animation: true,
        series: pieSeries
      };

      chart.setOption(option);

      const amapComponent = chart.getModel().getComponent('amap');
      const amap = amapComponent.getAMap();
      amap.addControl(new AMap.Scale());
      amap.addControl(new AMap.ToolBar());

      return () => {
        chart.dispose();
      };
    }).catch(error => {
      console.error('Failed to load AMap:', error);
    });
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default MapChart;
