import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundSplashScreen from "../../ImagesSource/BackgroundSplashScreen";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginBase from "../../lib/LoginBase";
import { useDispatch, useSelector } from "react-redux";
import { employee_data, employee_mail, employee_server, employee_token } from "../../features/employee/employeeSlice";
import AxiosGetDataAction from '../../lib/AxiosGetDataAction'
import { base64 } from "@firebase/util";
import { MASUKAN_TASK } from '../../features/desk/deskSlice'
import LoadData from "./LoadData";
// import loginFirebase from '../../lib/loginFirebase';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { getDatabase, ref, set } from "firebase/database";


const LOCATION_TASK_NAME = 'background-location-task';

export default function SplashScreen({ navigation, data }) {
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestBackgroundPermissionsAsync();
            if (status === 'granted') {
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.Highest,
                    distanceInterval: 1, // minimum change (in meters) betweens updates
                    deferredUpdatesInterval: 1000,
                });
            }
        })
        FirstCome()
    }, [])
    const dispatch = useDispatch()
    const FirstCome = () => {
        //Check if user_id is set or not
        //If not then send for Authentication
        //else send to Home Screen
        AsyncStorage.getItem('@AccountEmail', async (error, result) => {
            if (result === null) {
                navigation.replace('Auth')
            }
            else {
                const server = await AsyncStorage.getItem('@AccountServer')
                const dataEmployee = await AsyncStorage.getItem('@AccountEmployee')
                const token = await AsyncStorage.getItem('@AccountToken')
                const dataEmp = JSON.parse(dataEmployee)
                dispatch(employee_data(dataEmp))
                dispatch(employee_server(server))
                dispatch(employee_token(token))
                setTimeout(() => {
                    navigation.replace('BottomTabsNavigator')
                    
                }, 4000);
            }
        })
    }
    // loginFirebase(data)
    return (
        <LinearGradient style={{ flex: 1, }} colors={['#000', '#5463FF']}>
            <View style={{ flex: 1, justifyContent: 'center', alignContent: 'flex-end' }}>
                {/* <Text style={{ textAlign: 'center', fontFamily: 'Bold', fontSize: 30, color: '#ECECEC' }}>
                    {`HRIS`}
                </Text> */}
                <BackgroundSplashScreen />
                <Text style={styles.TextSub}>{`Simple things to make\nYour day better`}</Text>
            </View>
            <View style={{ height: '25%', alignSelf: 'center', justifyContent: 'flex-end' }}>
                <LoadData />
                <Text style={{ textAlign: 'center', marginTop: '20%', color: '#fff', fontFamily: 'Light' }}>V 2.0</Text>
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    TextSub: {
        borderRadius: 30,
        textAlign: 'center',
        marginTop: '10%',
        fontFamily: 'Regular',
        color: '#fff',
        marginHorizontal: 20,
        paddingHorizontal: 20
    }
})
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        // Error occurred - check `error.message` for more details.
        return;
    }
    if (data) {
        const { locations } = data;
        const db = getDatabase();
        AsyncStorage.getItem('@AccountEmail', async (error, result) => {
            if (result) {
                set(ref(db, 'LocationEmployee/' + result), locations[0].coords)
            }
            else {
                null
            }
        })
        // do something with the locations captured in the background
    }
});