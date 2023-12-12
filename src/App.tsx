import './App.css';
import { useEffect, useState, useRef } from 'react';
import { bitable, UIBuilder } from "@lark-base-open/js-sdk";
import { useTranslation } from 'react-i18next';
import { UseTranslationResponse } from 'react-i18next';
import './i18n';
import { Sankey, G2 } from "@antv/g2plot";
import { InputNumber, Space, Select, Button, Flex, Alert, ColorPicker, Col, Divider, Row, SelectProps, Typography } from 'antd';
import * as themeData from './g2plot_theme.json';



export default function App() {
    const { t } = useTranslation();
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
        theme = {
            colors20: [
                '#FF5733',
                '#C70039',
                '#900C3F',
                '#581845',
                '#1B4F72',
                '#2E86C1',
                '#AED6F1',
                '#A569BD',
                '#196F3D',
                '#F1C40F',
                '#FFC300',
                '#DAF7A6',
                '#FFC0CB',
                '#808000',
                '#0000FF',
                '#008080',
                '#800080',
                '#FFA500',
                '#00FFFF',
                '#FF00FF']
        },
    ) => {
        const oldChart = chartContainerRef.current.chart;
        if (oldChart) {
            oldChart.destroy();
        }

        const { registerTheme } = G2;
        console.log(theme);
        registerTheme('defaultTheme', theme);
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
        plot.update({ theme: 'defaultTheme' })
        plot.render();

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

        chartContainerRef.current.chart = plot;

    }

    const findNameById = (data: any, id: string): string | undefined => {
        const item = data.find((item: { id: string; }) => item.id === id);
        return item ? item.name : undefined;
    };

    const [options, setOptions] = useState<SelectProps['options']>([]);
    const [selectedValues, setSelectedValues] = useState<Array<string | undefined>>([undefined, undefined, undefined]);
    const [duplicateValuesAlert, setDuplicateValuesAlert] = useState<boolean>(false);
    const [showSecondLevelUI, setShowSecondLevelUI] = useState<boolean>(false);
    const [loadings, setLoadings] = useState<boolean>(false);
    const [chartError, setchartError] = useState<boolean>(false);

    //chart params
    const [nodeAlign, setnodeAlign] = useState('left');
    const [nodeWidth, setnodeWidth] = useState(15);
    const [nodePaddingRatio, setnodePaddingRatio] = useState(80);
    const [nodeOpacity, setnodeOpacity] = useState(100);
    const [linkOpacity, setlinkOpacity] = useState(80);
    const [textSize, settextSize] = useState(15);
    const [textWeight, settextWeight] = useState('normal');
    const [textColor, settextColor] = useState('#545454');

    //chart theme color select
    const [selectedTheme, setSelectedTheme] = useState('theme00');
    //colors here only for option showing
    const colorThemes = [
        {
            value: 'theme0', colors: [
                "#5B8FF9",
                "#5AD8A6",
                "#5D7092",
                "#F6BD16",
                "#6F5EF9",
                "#6DC8EC",
                "#945FB9",
                "#FF9845",
                "#1E9493",
                "#FF99C3"
            ]
        },
        {
            value: 'theme1', colors: [
                "#FF6B3B",
                "#626681",
                "#FFC100",
                "#9FB40F",
                "#76523B",
                "#DAD5B5",
                "#0E8E89",
                "#E19348",
                "#F383A2",
                "#247FEA"
            ]
        },
        {
            value: 'theme2', colors: [
                "#025DF4",
                "#DB6BCF",
                "#2498D1",
                "#BBBDE6",
                "#4045B2",
                "#21A97A",
                "#FF745A",
                "#007E99",
                "#FFA8A8",
                "#2391FF"
            ]
        },
        {
            value: 'theme3', colors: [
                "#FF4500",
                "#1AAF8B",
                "#406C85",
                "#F6BD16",
                "#B40F0F",
                "#2FB8FC",
                "#4435FF",
                "#FF5CA2",
                "#BBE800",
                "#FE8A26"
            ]
        },
    ];
    const { Option } = Select;


    useEffect(() => {
        const fetchData = async () => {
            const newOptions: SelectProps['options'] = [];
            const selection = await bitable.base.getSelection();
            const table = await bitable.base.getTableById(selection?.tableId!);
            const fieldMetaList = await table.getFieldMetaList();
            for (let a of fieldMetaList) {
                newOptions.push({
                    label: a.name,
                    value: a.id,
                });
            }
            setOptions(newOptions);
        };
        fetchData();
    }, [])

    const isNextButtonDisabled = !(selectedValues[0] && selectedValues[1] && selectedValues[2]);
    const handleNextButtonClick = async () => {
        if (selectedValues[0] === selectedValues[1] ||
            selectedValues[0] === selectedValues[2] ||
            selectedValues[1] === selectedValues[2]) {
            //console.log('duplicate choise');
            setDuplicateValuesAlert(true);
        } else {
            setDuplicateValuesAlert(false);
            setShowSecondLevelUI(true);
        }
    }

    const handleChange = (index: number, value: string | undefined) => {
        const newSelectedValues = [...selectedValues];
        newSelectedValues[index] = value;
        setSelectedValues(newSelectedValues);
    };

    const handleSubmitButtonClick = async () => {
        console.log(nodeAlign);
        console.log(nodeWidth);
        console.log(nodePaddingRatio);
        console.log(nodeOpacity);
        console.log(linkOpacity);
        console.log(textSize);
        console.log(textWeight);
        console.log(textColor);
        console.log(selectedTheme);
        setLoadings(true);
        const selection = await bitable.base.getSelection();
        const table = await bitable.base.getTableById(selection?.tableId!);
        const fieldMetaList = await table.getFieldMetaList();
        const recordIdList = await table.getRecordIdList();

        const rename_dic = {
            'source_index': findNameById(fieldMetaList, selectedValues[0]),
            'target_index': findNameById(fieldMetaList, selectedValues[1]),
            'value_index': findNameById(fieldMetaList, selectedValues[2]),
        };
        const origin_data = [];
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
        setLoadings(false);
        console.log(chartData);
        console.log(themeData[selectedTheme])
        if (chartContainerRef.current) {
            try {
                await chartComponent(
                    chartData,
                    nodeAlign,
                    nodeWidth / 1000,
                    nodePaddingRatio / 1000,
                    linkOpacity / 100,
                    nodeOpacity / 100,
                    textSize,
                    textWeight,
                    textColor,
                    themeData[selectedTheme],
                );
            } catch (error) {
                console.error(error);
                setchartError(true);
            }
        }
    }

    const { Title, Paragraph, Text, Link } = Typography;

    return (
        <main>
            <Typography>
                <Paragraph style={{width: '75%', marginLeft: '20px'}}>
                    <blockquote>
                        {t('d_l1')}
                        <br />
                        {t('d_l2')}
                        <Link href="https://lwmwpiwc4ry.feishu.cn/base/V4JBbjWJpaJJZksXPZvcdJLenAh?table=tblMQj9A1mgA7uka&view=vewTC4u06G" target="_blank">{t('示例表格')}</Link>
                        <br />
                        {t('d_l3')}
                        <Link href="https://lwmwpiwc4ry.feishu.cn/docx/TKZidd3QIodW9fxMx8xcc2LjnU5?from=from_copylink" target="_blank">{t('说明文档')}</Link>
                    </blockquote>
                </Paragraph>
            </Typography>

            <Space wrap style={{ width: '100%', margin: '20px' }} direction="horizontal">
                <span style={{ fontSize: '15px' }}>{t('选择起点列')}</span>
                <Select
                    style={{ width: 150, marginRight: '10px' }}
                    placeholder=""
                    value={selectedValues[0]}
                    onChange={(value) => handleChange(0, value)}
                    options={options}
                />
                <span style={{ fontSize: '15px' }}>{t('选择终点列')}</span>
                <Select
                    style={{ width: 150, marginRight: '10px' }}
                    placeholder=""
                    value={selectedValues[1]}
                    onChange={(value) => handleChange(1, value)}
                    options={options}
                />
                <span style={{ fontSize: '15px' }}>{t('选择数值列')}</span>
                <Select
                    style={{ width: 150, marginRight: '10px' }}
                    placeholder=""
                    value={selectedValues[2]}
                    onChange={(value) => handleChange(2, value)}
                    options={options}
                />
            </Space>
            <Flex gap="small" style={{ marginLeft: '20px', width: '50%' }}>
                <Button
                    type="default"
                    block
                    disabled={isNextButtonDisabled}
                    onClick={handleNextButtonClick}
                >
                    {t('下一步')}
                </Button>
            </Flex>
            {duplicateValuesAlert && (
                <Alert
                    message={t("请选择不同列")}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setDuplicateValuesAlert(false)}
                    style={{ margin: '15px' }}
                />
            )}
            {showSecondLevelUI && (
                <div style={{ marginTop: '20px', marginLeft: '20px' }}>
                    <Row gutter={[16, 24]}>
                        <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                <span style={{ fontSize: '15px', marginRight: '10px' }}>{t('节点对齐方式')}</span>
                                <Select
                                    defaultValue="right"
                                    style={{ width: 90 }}
                                    onChange={(value) => setnodeAlign(value)}
                                    options={[
                                        { label: t('靠左'), value: 'left' },
                                        { label: t('靠右'), value: 'right' },
                                        //{ label: '中心', value: 'center' },
                                        { label: t('分布左右'), value: 'justify' }
                                    ]}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                <span style={{ fontSize: '15px', marginRight: '10px' }}>{t('节点宽度')}</span>
                                {/*min={1} max={10} */}
                                <InputNumber defaultValue={15} onChange={(value) => setnodeWidth(value)} />
                                <span style={{ marginLeft: '5px' }}>px</span>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                <span style={{ fontSize: '15px', marginRight: '10px' }}>{t('节点垂直间距')}</span>
                                <InputNumber defaultValue={80} onChange={(value) => setnodePaddingRatio(value)} />
                                <span style={{ marginLeft: '5px' }}>px</span>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                <span style={{ fontSize: '15px', marginRight: '10px' }}>{t('节点透明度')}</span>
                                <InputNumber defaultValue={100} onChange={(value) => setnodeOpacity(value)} />
                                <span style={{ marginLeft: '5px' }}>%</span>
                            </div>
                        </Col>

                        <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                <span style={{ fontSize: '15px', marginRight: '15px' }}>{t("连接透明度")}</span>
                                <InputNumber defaultValue={80} onChange={(value) => setlinkOpacity(value)} />
                                <span style={{ marginLeft: '5px' }}>%</span>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                <span style={{ fontSize: '15px', marginRight: '10px' }}>{t("标注字体大小")}</span>
                                <InputNumber defaultValue={15} onChange={(value) => settextSize(value)} />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                <span style={{ fontSize: '15px', marginRight: '10px' }}>{t('标注字体粗细')}</span>
                                <Select
                                    defaultValue="normal"
                                    style={{ width: 90 }}
                                    onChange={(value) => settextWeight(value)}
                                    options={[
                                        { label: t('普通'), value: 'normal' },
                                        { label: t('粗'), value: 'bolder' },
                                        { label: t('细'), value: 'lighter' },
                                    ]}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                <span style={{ fontSize: '15px', marginRight: '10px' }}>{t('标注字体颜色')}</span>
                                <ColorPicker
                                    showText
                                    onChange={(value) => settextColor(value.toHexString())}
                                />
                            </div>
                        </Col>
                        <Col>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                <span style={{ fontSize: '15px', marginRight: '10px' }}>{t('图表主题颜色')}</span>

                                <Select
                                    defaultValue='theme00'

                                    onChange={setSelectedTheme}
                                    style={{ width: '220px' }}
                                >
                                    <Option value="theme00">{t('默认颜色主题')}</Option>
                                    {colorThemes.map((theme, index) => (
                                        <Option key={index} value={theme.value}>
                                            <div style={{ display: 'flex' }}>

                                                {theme.colors.map((color, index) => (
                                                    <div key={index} style={{ backgroundColor: color, height: '15px', width: '20px' }} />
                                                ))}
                                            </div>
                                        </Option>
                                    ))}
                                </Select>

                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>

                            </div>
                        </Col>

                    </Row>


                    <Flex gap="small" style={{ width: '52%', marginTop: '20px' }}>
                        <Button type="primary" onClick={handleSubmitButtonClick} loading={loadings} block>
                            {t('确定')}
                        </Button>
                    </Flex>

                    {chartError && (
                        <Alert
                            message={t("绘图数据有误")}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setchartError(false)}
                            style={{ margin: '15px' }}
                        />
                    )}
                </div>


            )}
            <div ref={chartContainerRef} style={{ width: '97%', height: '425px', resize: 'vertical', overflow: 'auto' }}></div>

        </main>


    );
}