import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Pressable } from "react-native";
import moment from "moment";
import NewQuotes from "../lib/quotes";
import * as Location from 'expo-location';
import { useDispatch, useSelector } from "react-redux";
import { dataKehadiranEntry } from "../features/attendance/kehadiranSlice";
import NewSocketIN from "../lib/NewSocketIN";
import GetAttendance from '../lib/GetAttendance'
import axios from "axios";
import { Button, Card, Layout, Modal } from '@ui-kitten/components';

export default function ButtonInFullTime() {
    const dispatch = useDispatch()
    const [location, setLocation] = useState(null)
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true)
    const [berhasil, setBerhasil] = useState(false)
    const [jumlah, setJumlah] = useState(null)
    const [buttonsIN, setButtonsIN] = useState(false)
    const { employee, server, token } = useSelector(state => state.employee)
    const dataX = {
        owner: employee.employee,
        token,
        server
    }
    const panggilan = useRef(null)
    const ws = new WebSocket('ws://103.179.57.18:21039/Attendance')
    const [jam, setJam] = useState(moment().format('H'))
    useEffect(() => {
        getLocations()
        getAttendance()

    }, [])

    const getAttendance = () => {
        panggilan.current = setInterval(() => {
            GetAttendance(dataX).then(res => {
                let data = res.data
                dispatch(dataKehadiranEntry(data))
                setJumlah(data.length)
                setLoading(false)
            }).catch(err => console.log(err))
        }, 3000)
    }

    const getLocations = async () => {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
    }
    const getPresent = (xdata) => {
        clearInterval(panggilan.current)
        setVisible(true)
        let payload = {
            employee: employee.employee,
            log_type: xdata,
            device_id: 'ONL_APP_MOBILE',
            time: moment().format("YYYY-MM-DD HH:mm:ss"),
            skip_auto_attendance: 0,
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
        }
        let data = {
            token,
            server,
            payload
        }
        axios.post('http:///103.179.57.18:21039/dateAttendance/PostMasuk', data).then(res => {
            let data = (res.data)
            setBerhasil(true)
            dispatch(dataKehadiranEntry(data))
            setJumlah(data.length)
            panggilan.current = setInterval(() => {
                GetAttendance(dataX).then(res => {
                    let data = res.data
                    dispatch(dataKehadiranEntry(data))
                    setJumlah(data.length)
                    setLoading(false)
                }).catch(err => console.log(err))
            }, 3000)
        })
            .catch(err => console.log(err))
        // setModalVisible(true)
        // setButtonsIN(true)
        // setLoading(true)
        // setTimeout(() => {
        //     NewSocketIN(data)
        //     ws.send(JSON.stringify(dataX))
        //     setTimeout(() => {
        //         setLoading(false)
        //         setButtonsIN(false)
        //     }, 1000)
        // }, 1000)
    }
    const dataReturn = () => {
        if (jumlah == null || loading) {
            return (
                <TouchableOpacity style={styles.buttonClose} disabled>
                    <Text style={styles.textIN}>
                        Tunggu
                    </Text>
                </TouchableOpacity>
            )
        }
        else {
            if (jumlah == 1 && jam >= 14) {
                return (
                    <TouchableOpacity style={styles.buttonOUT} onPress={() => getPresent('OUT')} disabled={buttonsIN}>
                        <Text style={styles.textIN}>
                            Pulang
                        </Text>
                    </TouchableOpacity>
                )
            }
            else if (jumlah == 0 && jam <= 13) {
                return (
                    <TouchableOpacity style={styles.buttonIN} onPress={() => getPresent('IN')} disabled={buttonsIN}>
                        <Text style={styles.textIN}>
                            Masuk
                        </Text>
                    </TouchableOpacity>
                )
            }
            else {
                return (
                    <TouchableOpacity style={styles.buttonClose} disabled>
                        <Text style={styles.textIN}>
                            Tutup
                        </Text>
                    </TouchableOpacity>
                )
            }
        }
    }
    return (
        <>
            {dataReturn()}
            <Modal visible={visible}>
                <Card disabled={true}>
                    <Text style={{ fontFamily: 'Bold', textAlign: 'center' }}>Data sedang di Cek</Text>
                    <Text style={{ fontFamily: 'ThinItalic', textAlign: 'center' }}>{NewQuotes()}</Text>
                    <Text style={{ fontFamily: 'Regular', textAlign: 'center' }}>Status absensi <Text style={{ fontFamily: 'Medium', color: 'red' }}>{berhasil === false ? 'Check' : 'Berhasil'}</Text></Text>
                    {berhasil === true ? <Button style={{ marginTop: '50%' }} onPress={() => setVisible(false)}>
                        Okey
                    </Button>
                        :
                        null}
                </Card>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    ClosedBtn: {
        fontFamily: 'Medium',
        backgroundColor: "#2196F3",
    },
    buttonIN: {
        flex: 1,
        backgroundColor: '#143F6B',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15
    },
    buttonOUT: {
        flex: 1,
        backgroundColor: '#F55353',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15
    },
    buttonClose: {
        flex: 1,
        backgroundColor: '#383838',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15
    },
    textIN: {
        fontFamily: 'Medium',
        fontSize: 16,
        color: '#fff'
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
})