import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Divider, List, ListItem, Layout, Text, Button } from '@ui-kitten/components';
import { TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { base64 } from "@firebase/util";
import moment from 'moment';
import ListHistorySection from '../../../Molecule/ListHistorySection';
import IstirahatSectionList from '../../../Molecule/ListHistorySection/IstirahatSectionList';
import TanggalRow from '../../../Molecule/ListHistorySection/TanggalRow';
moment.locale('id')

export default function History() {
    return (
        <Layout style={{ flex: 1 }}>
            <TanggalRow />
            {SaatIni()}
            <ListHistorySection />
            <IstirahatSectionList />
        </Layout>
    )
}
function SaatIni() {
    return (
        <Layout style={{ marginHorizontal: 10, flexDirection: 'row', marginTop: '20%' }}>
            <Layout style={{ marginRight: '10%' }}>
                <Text style={{ fontFamily: 'Bold' }}>Jam</Text>
            </Layout>
            <Layout style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Bold' }}>Keterangan</Text>
            </Layout>
        </Layout>
    )
}