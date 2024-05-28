import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import {LineChart} from "react-native-chart-kit";
import { ScrollView } from 'react-native-gesture-handler';

const Home = () => {
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    const navigation = useNavigation();
    const [lastSevenDates, setLastSevenDates] = useState([]);
    const [chartDataPoints, setChartDataPoints] = useState([2000, 3400, 2800, 4600, 5000, 4000, 3500]);

    const transactionsData = [
        {name: 'Nitesh', amount: 1050, billNo: '34839189'},
        {name: 'Jatin', amount: 1570, billNo: '72598981'},
        {name: 'Noushil', amount: 830, billNo: '82490130'},
        {name: 'Aryan', amount: 550, billNo: '90283490'},
        {name: 'Siddhant', amount: 2200, billNo: '48530232'},
        {name: 'Pranjal', amount: 1750, billNo: '34895439'},
        {name: 'Nilu', amount: 1240, billNo: '23483920'},
    ]

    const formatDate = (date) => {
        var dd = date.getDate();
        var mm = date.getMonth()+1;
        var yyyy = date.getYear();
        if(dd<10) {dd='0'+dd}
        if(mm<10) {mm='0'+mm}
        date = dd+'/'+mm;
        return date
    }

    const getLastSeventDates = () => {
        var result = [];
        for (var i=6; i>=0; i--) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            result.push(formatDate(d))
        }
    
        setLastSevenDates(result);
    }

    useEffect(() => {
        getLastSeventDates();
    }, [])

    const data = {
        labels: lastSevenDates,
        datasets: [
          {
            data: chartDataPoints,
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
            strokeWidth: 2 // optional
          }
        ],
    };

    return (
        <View style={{flex: 1, backgroundColor: '#F5F5F5', marginTop: 30}}>
            <View style={{
                paddingHorizontal: 15,
            }}>
                <Text 
                    style={{
                        fontSize: 22,
                        paddingVertical: 10,
                        fontWeight: 'bold',
                        color: '#211951',
                        letterSpacing: 1,
                    }}
                >
                    {"Sales"}
                </Text>
                <View style={{alignItems: 'center'}}>
                    <LineChart
                        data={data}
                        width={screenWidth*0.93}
                        height={screenHeight*0.3}
                        chartConfig={{
                            backgroundColor: "#F1EAFF",
                            backgroundGradientFrom: "#F1EAFF",
                            backgroundGradientTo: "#F1EAFF",
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        style={{
                            borderRadius: 15,
                            elevation: 2,
                        }}
                    />
                </View>
            </View>

            <View style={{marginTop: 20, paddingHorizontal: 15}}>
                <Text 
                    style={{
                        fontSize: 22,
                        paddingVertical: 10,
                        fontWeight: 'bold',
                        color: '#211951'
                    }}
                >
                    {"Previous Transactions"}
                </Text>
                <ScrollView 
                    style={{height: screenHeight*0.49}}
                    showsVerticalScrollIndicator={false}
                >
                    {
                        transactionsData.map(({name, amount, billNo}, index) => {
                            return (
                                <View 
                                    style={{
                                        height: screenHeight*0.08, 
                                        width: '100%', 
                                        flexDirection: 'row', 
                                        justifyContent: 'space-between',
                                        marginBottom: 10,
                                        borderRadius: 10,
                                        paddingHorizontal: 15,
                                        paddingVertical: 5,
                                        alignItems: 'center',
                                        elevation: 2,
                                        backgroundColor: 'white'
                                    }}
                                    key={index}
                                >
                                    <View>
                                        <Text
                                            style={{
                                                fontSize: 18,
                                                color: '#211951',
                                                fontWeight: '500',
                                            }}
                                        >
                                            {name}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                color: '#868686',
                                                letterSpacing: 1
                                            }}
                                        >{'Bill No: ' + billNo}</Text>
                                    </View>
                                    <View>
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                color: '#17b02a',
                                            }}
                                        >{"Received"}</Text>
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                color: '#17b02a',
                                                fontWeight: 'bold'
                                            }}
                                        >{'₹ ' + amount}</Text>
                                    </View>
                                </View>
                            );
                        })
                    }
                </ScrollView>
            </View>
        </View>
    )
}

export default Home

const styles = StyleSheet.create({})