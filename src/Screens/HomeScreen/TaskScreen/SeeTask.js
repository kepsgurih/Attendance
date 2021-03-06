import { Button, Layout, Spinner, Text } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, View, Alert } from "react-native";
import WaittingImage from "../../../ImagesSource/WaittingImage";
import moment from "moment";
import RenderHTML from "react-native-render-html";
import { useSelector } from "react-redux";
import { base64 } from "@firebase/util";
import RangeSlider, { Slider } from 'react-native-range-slider-expo';
import { getDatabase, ref, onValue, equalTo, query, orderByChild, push, set } from "firebase/database";
import { Paragraph, Dialog, Portal, Provider } from 'react-native-paper';
import WebhookUrl from "../../../lib/WebhookUrl";
import axios from "axios";

export default function SeeTask({ route }) {
    const db = getDatabase()
    const { server, employee, token } = useSelector(state => state.employee)
    const [Loading, setLoading] = useState(true)
    const { TaskID } = route.params
    const [dataHt, setDataHt] = useState(null)
    const [value, setValue] = useState(0);
    const [progress, setProgress] = useState()
    const [isLoadingScene, setIsLoadingScene] = useState()
    const [dataRealtime, setDataRealTime] = useState()
    const [msg, setMsg] = useState('')
    const [visible, setVisible] = useState()
    const [buttonDisable, setButtonDisable] = useState(true)
    const hideDialog = () => setVisible(false);

    // Slider


    // end Slider
    useEffect(() => {
        panggilData()

        if (!Loading) {
        }

    }, [Loading])
    const panggilData = async () => {
        await axios.get(`https://${base64.decodeString(server)}/api/resource/Task/${TaskID}`, {
            headers: {
                'Authorization': `token ${base64.decodeString(token)}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'application/json',
            }
        })
            .then(res => {
                const data = res.data.data
                const regex = /\/files\//ig
                const html = data.description
                if (html) {
                    const result = html.replace(regex, `https://${base64.decodeString(server)}/files/`);
                    setDataHt({
                        html: result
                    })
                }
                setDataRealTime(data)
                setLoading(false)
            })
            .catch(err => {
                Alert.alert('Terjadi Kesalahan', `Koneksi Tidak stabil\n${err}`, [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ]);
            })
    }
    const gantiProgress = async () => {
        setIsLoadingScene(true)
        if (dataRealtime.progress == value) {
            setIsLoadingScene(false)
            setMsg(`Tidak ada perubahan yang terjadi, ubah persentase progress dengan cara menggeser tombol berwarna putih`)
            setVisible(true)
        }
        else {
            setVisible(true)
            setMsg(`Perubahan dilakukan, pada persentase progress`)
            const dataBaru = {
                ...dataRealtime,
                progress: value
            }
            let payload
            if (value == 100) {
                payload = {
                    progress: 100,
                    status: 'Closed'
                }
            }
            if (value < 100) {
                payload = {
                    progress: value,
                }
            }
            MasukanKeDatabase(payload, dataBaru)
        }
        // set(ref(db, `Task/${base64.encodeString(employee.user_id)}/${TaskID}`), dataBaru)
    }
    const MasukanKeDatabase = (payload, dataBaru) => {
        axios.put(`https://${base64.decodeString(server)}/api/resource/Task/${TaskID}`, payload, {
            headers: {
                'Authorization': `token ${base64.decodeString(token)}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'application/json',
            }
        }).then(res => {
            set(ref(db, `Task/${base64.encodeString(employee.user_id)}/${TaskID}`), dataBaru)
            setIsLoadingScene(false)
        }).catch(err => console.log(err))
    }
    return (
        <Provider>

            <Layout style={{ flex: 1, backgroundColor: 'white' }}>
                {Loading ?
                    <LoadingScreen />
                    :
                    <>
                        <View style={{ flex: 1 }}>
                            <ScrollView>
                                <Layout level={'4'} style={{ margin: 20 }}>
                                    <Text style={{ textAlign: 'center', fontFamily: 'Medium', fontSize: 17 }}>{dataRealtime.subject}</Text>
                                    <Text style={{ textAlign: 'center', fontFamily: 'Regular', fontSize: 10 }}>{dataRealtime.name}</Text>
                                    <View style={{ marginVertical: 10, marginHorizontal: 50, height: 1, backgroundColor: 'black' }}>

                                    </View>
                                    <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5 }}>
                                        <Text style={{ textAlign: 'left', flex: 1 }}>{dataRealtime.type}</Text>
                                        <Text style={{ textAlign: 'right', fontFamily: 'Medium', flex: 1 }}>{dataRealtime.priority}</Text>

                                    </View>
                                </Layout>
                                <Layout style={{ margin: 20 }}>
                                    {dataHt ? <RenderHTML contentWidth={Dimensions.get('window').width} source={dataHt} /> : null}
                                </Layout>
                            </ScrollView>
                        </View>
                        <Layout level={'4'} style={{ height: '10%', flexDirection: 'row' }}>
                            <Slider
                                min={0} max={100} step={1}
                                valueOnChange={s => setValue(s)}
                                initialValue={dataRealtime.progress}
                                knobColor='white'
                                outOfRangeBarColor='black'
                                showRangeLabels={false}
                                styleSize={'small'}
                                style={{}}
                            />
                            <Text style={{ position: 'absolute', marginHorizontal: 30, fontFamily: 'Regular', top: 20, fontSize: 10 }}>Slide Progress {value} %</Text>
                            <Button style={{ margin: 10 }} disabled={dataRealtime.progress == '100'} onPress={() => {
                                gantiProgress()
                            }}>{dataRealtime.progress == '100' ? 'Selesai' : `Ubah ${dataRealtime.progress}%`}</Button>
                        </Layout>
                    </>
                }
            </Layout>
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Laporan Tugas</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>{msg}</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Mengerti</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </Provider>
    )
}


function LoadingScreen() {
    return (
        <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <WaittingImage />
            <ActivityIndicator style={{ marginVertical: '5%' }} color={'blue'} />
            <Text style={{ fontFamily: 'Regular' }}>Tunggu Sebentar</Text>
        </Layout>
    )
}