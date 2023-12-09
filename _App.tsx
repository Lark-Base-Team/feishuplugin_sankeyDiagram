import './App.css';
import { useEffect, useState, useRef } from 'react';
import { bitable, UIBuilder } from "@lark-base-open/js-sdk";
import { useTranslation } from 'react-i18next';
import { UseTranslationResponse } from 'react-i18next';
import { Sankey, G2 } from "@antv/g2plot";


const backend_url = 'http://localhost:5000/';
//const backend_url = 'https://sankeydiagramflasktemplate.1790414525klz.repl.co/';


export default function App() {
    const translation = useTranslation();
    const enableChartRef = useRef(false);
    const chartContainerRef = useRef(null);

    const chartComponent = async (
        data: any[],
        nodeAlign = 'right', //布局方向
        nodeWidth = 0.03, //节点宽度
        nodePaddingRatio = 0.03,//节点垂直间距
        linkOpacity = 0.8,//连接透明度
        nodeOpacity = 1,//节点透明度
        textSize = 15,//标签字体大小
        textWeight = 'normal',//标签字体粗细
        textColor = '#545454',//标签字体颜色
    ) => {
        const oldChart = chartContainerRef.current.chart;
        if (oldChart) {
            oldChart.destroy();
        }
        const { registerTheme } = G2;
        registerTheme('defaultTheme', {
            colors20: [
                '#FF5733', // 鲜艳的橙色
                '#C70039', // 鲜艳的红色
                '#900C3F', // 鲜艳的紫红色
                '#581845', // 鲜艳的紫色
                '#1B4F72', // 鲜艳的深蓝色
                '#2E86C1', // 鲜艳的蓝色
                '#AED6F1', // 鲜艳的浅蓝色
                '#A569BD', // 鲜艳的紫色
                '#196F3D', // 鲜艳的深绿色
                '#F1C40F', // 鲜艳的黄色
                '#FFC300', // 鲜艳的金色
                '#DAF7A6', // 鲜艳的浅绿色
                '#FFC0CB', // 鲜艳的粉色
                '#808000', // 鲜艳的橄榄色
                '#0000FF', // 鲜艳的纯蓝色
                '#008080', // 鲜艳的青色
                '#800080', // 鲜艳的紫色
                '#FFA500', // 鲜艳的橙色
                '#00FFFF', // 鲜艳的青色
                '#FF00FF'  // 鲜艳的洋红色
            ]
        })
        const plot = new Sankey(chartContainerRef.current, {
            data: data,
            sourceField: 'source',
            targetField: 'target',
            weightField: 'value',
            padding: 10,
            edgeStyle: {
                fillOpacity: linkOpacity,
            },
            nodeStyle: {
                opacity: nodeOpacity,
            },
            label: {
                formatter: ({ name }) => name,
                callback: (x: number[]) => {
                    const isLast = x[1] === 1; // 最后一列靠边的节点
                    return {
                        style: {
                            fill: textColor,
                            textAlign: isLast ? 'end' : 'start',
                            fontSize: textSize,
                            fontWeight: textWeight as "normal" | "bolder" | "lighter",
                        },
                        offsetX: isLast ? -8 : 8,
                    };
                },
                layout: [
                    {
                        type: 'hide-overlap',
                    },
                ],
            },
            
            //节点降序排序
            //nodeSort: (a, b) => b.value - a.value,
            nodeWidthRatio: nodeWidth,
            nodeAlign: nodeAlign as "left" | "right" | "center" | "justify",
            nodePaddingRatio: nodePaddingRatio,
            nodeDraggable: true,
            rawFields: ['path'],
            tooltip: {
                fields: ['path', 'value'],
                formatter: ({ path, value }) => {
                    return {
                        name: path,
                        value: value,
                    };
                },
            },
        });
        plot.update({theme: 'defaultTheme'})
        plot.render();
        /*
                plot.on("element:mouseenter", (event) => {
                    const node = event.data.data;
                    if (!node.isNode) return;
                    plot.setState("active", (data: any) => {
                        const { isNode, source, target, name } = data;
                        if (!isNode) {
                            if ([source, target].includes(node.name)) return true;
                        } else if (name == node.name) return true;
        
                        return false;
                    });
                });
        
                plot.on("element:mouseout", (event) => {
                    const elements = event.view.views[0].geometries[0].elements;
                    elements.forEach((edge: any) => edge?.setState("active", false));
                });
        */
        chartContainerRef.current.chart = plot;

    }

    const findNameById = (data: any, id: string): string | undefined => {
        const item = data.find((item: { id: string; }) => item.id === id);
        return item ? item.name : undefined;
    };

    const callback = async (uiBuilder: UIBuilder, { t }: UseTranslationResponse<'translation', undefined>) => {
        uiBuilder.markdown(`--------------`);
        uiBuilder.form((form) => ({
            formItems: [
                form.tableSelect('table', { label: '选择数据表', defaultValue: '' }),
                form.fieldSelect('source_index', { label: '选择起点列', sourceTable: 'table' }),
                form.fieldSelect('target_index', { label: '选择终点列', sourceTable: 'table' }),
                form.fieldSelect('value_index', { label: '选择数值列', sourceTable: 'table' })
            ],
            buttons: ['下一步'],

        }), async ({ key, values }) => {
            //process selected fields from frontend
            uiBuilder.showLoading('Loading...');
            const { _table, source_index, target_index, value_index } = values;
            const selection = await bitable.base.getSelection();
            const table = await bitable.base.getTableById(selection?.tableId!);
            const fieldMetaList = await table.getFieldMetaList();
            uiBuilder.hideLoading();
            console.log(fieldMetaList);
            try {
                if ((source_index as { id?: any })?.id === (target_index as { id?: any })?.id ||
                    (source_index as { id?: any })?.id === (value_index as { id?: any })?.id ||
                    (target_index as { id?: any })?.id === (value_index as { id?: any })?.id) {
                    throw new Error('选择了重复的列');
                }

                const rename_dic = {
                    'source_index': findNameById(fieldMetaList, (source_index as { id?: any })?.id),
                    'target_index': findNameById(fieldMetaList, (target_index as { id?: any })?.id),
                    'value_index': findNameById(fieldMetaList, (value_index as { id?: any })?.id),
                };
                console.log(rename_dic)

                //
                uiBuilder.showLoading('Loading...');
                const origin_data = [];
                const recordIdList = await table.getRecordIdList();

                for (let i = 0; i < recordIdList.length; i++) {
                    const recordData = {};
                    for (let a = 0; a < fieldMetaList.length; a++) {
                        const cellString = await table.getCellString(fieldMetaList[a]?.id!, recordIdList[i]!);
                        recordData[fieldMetaList[a]?.name] = cellString;
                    }
                    origin_data.push(recordData);
                }

                const s_i = rename_dic['source_index'];
                const t_i = rename_dic['target_index'];
                const v_i = rename_dic['value_index'];
                const chartData = [];
                for (const entry of origin_data) {
                    let new_entry = {
                        'source': entry[s_i],
                        'target': entry[t_i],
                        'value': entry[v_i],
                        'path': `${entry[s_i]} -> ${entry[t_i]} -> ${entry[v_i]}`
                    }
                    chartData.push(new_entry);
                }
                chartData.forEach((item, index) => {
                    item.value = parseFloat(item.value);
                });

                console.log(chartData);
                uiBuilder.hideLoading();


                uiBuilder.form((form) => ({
                    formItems: [
                        form.select('nodeAlign', {
                            label: '节点对齐方式', options: [
                                { label: '靠左', value: 'left' },
                                { label: '靠右', value: 'right' },
                                //{ label: '中心', value: 'center' },
                                { label: '分布左右', value: 'justify' }
                            ], defaultValue: 'right'
                        }),
                        form.inputNumber('nodeWidth', { label: '节点宽度', defaultValue: 15 }),//*1000
                        form.inputNumber('nodePaddingRatio', { label: '节点垂直间距', defaultValue: 80 }),//*1000
                        form.inputNumber('nodeOpacity', { label: '节点透明度', defaultValue: 100 }),//*100
                        form.inputNumber('linkOpacity', { label: '连接透明度', defaultValue: 80 }),//*100
                        //form.checkboxGroup('checkbox', { label: '选择标签显示内容', options: ['节点名称', '节点数据'], defaultValue: ['节点名称'] }),
                        form.inputNumber('textSize', { label: '标签字体大小', defaultValue: 15 }),
                        form.select('textWeight', {
                            label: '标签字体粗细', options: [
                                { label: '普通', value: 'normal' },
                                { label: '粗', value: 'bolder' },
                                { label: '细', value: 'lighter' },
                            ], defaultValue: 'normal'
                        }),
                        form.select('textColor', {
                            label: '标签字体颜色',
                            options: [
                                { label: '默认', value: '#545454' },
                                { label: '黑色', value: '#000000' },
                                { label: '白色', value: '#FFFFFF' },
                                { label: '红色', value: '#FF0000' },
                                { label: '橙色', value: '#FFA500' },
                                { label: '黄色', value: '#FFFF00' },
                                { label: '绿色', value: '#008000' },
                                { label: '蓝色', value: '#0000FF' },
                                { label: '紫色', value: '#800080' },
                                { label: '棕色', value: '#A52A2A' },
                                { label: '灰色', value: '#808080' },
                            ], defaultValue: '#545454'
                        }),

                    ],
                    buttons: ['确定']
                }), async ({ key, values }) => {
                    const { nodeAlign, nodeWidth, nodePaddingRatio, linkOpacity, nodeOpacity, textSize, textWeight, textColor } = values
                    enableChartRef.current = true;

                    if (chartContainerRef.current && enableChartRef.current) {
                        try {
                            const params: {
                                nodeAlign?: string;
                                nodeWidth?: number;
                                nodePaddingRatio?: number;
                                linkOpacity?: number;
                                nodeOpacity?: number;

                                textSize?: number;
                                textWeight?: string;
                                textColor?: string;
                            } = {
                                nodeAlign: typeof nodeAlign === 'string' ? nodeAlign : undefined,
                                nodeWidth: typeof nodeWidth === 'number' ? nodeWidth : undefined,
                                nodePaddingRatio: typeof nodePaddingRatio === 'number' ? nodePaddingRatio : undefined,
                                linkOpacity: typeof linkOpacity === 'number' ? linkOpacity : undefined,
                                nodeOpacity: typeof nodeOpacity === 'number' ? nodeOpacity : undefined,

                                textSize: typeof textSize === 'number' ? textSize : undefined,
                                textWeight: typeof textWeight === 'string' ? textWeight : undefined,
                                textColor: typeof textColor === 'string' ? textColor : undefined,
                            };

                            await chartComponent(
                                chartData,
                                params.nodeAlign,
                                params.nodeWidth / 1000,
                                params.nodePaddingRatio / 1000,
                                params.linkOpacity / 100,
                                params.nodeOpacity / 100,

                                params.textSize,
                                params.textWeight,
                                params.textColor,
                            );

                        } catch (error) {
                            console.error(error);
                            uiBuilder.message.error('绘图数据有误');
                        }
                    }
                });
            } catch (error) {
                if ((error as any).message == '选择了重复的列') {
                    uiBuilder.message.error('选择了重复的列', [5]);
                } else {
                    uiBuilder.message.error('没有选择目标列', [5]);
                }
            }

        });
    }

    useEffect(() => {
        const uiBuilder = new UIBuilder(document.querySelector('#container') as HTMLElement, {
            bitable,
            callback,
            translation,
        });
        return () => {
            uiBuilder.unmount();
        };
    }, [translation]);

    return (
        <main>
            <div ref={chartContainerRef} style={{ width: '97%', height: '100px', resize: 'vertical', overflow: 'auto' }}></div>
            <div id='container'></div>
        </main>

    );
}