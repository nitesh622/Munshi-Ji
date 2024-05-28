import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

const BarGraph = ({data}) => {
    console.log(data);
    return (
        <View 
            style={{
                // height: responsiveHeight(35),
                // width: responsiveWidth(90),
                borderWidth: 1,
                padding: responsiveHeight(2),
            }}
        >
            <View>
                <View style={{flexDirection: 'row', height: '85%'}}>
                    <View style={{justifyContent: 'space-between', marginRight: responsiveWidth(2), width: '12%', alignItems: 'flex-end'}}>
                        {
                            // data?.sales.
                            data?.sales?.map((val, index) => {
                                return (
                                    <Text
                                        key={index}
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            fontWeight: '500',
                                            flexWrap: 'wrap'
                                        }}
                                    >
                                        {val}
                                    </Text>
                                );
                            })
                        }
                    </View>
                    <View
                        style={{
                            borderLeftWidth: 1,
                            borderBottomWidth: 1,
                            height: '100%',
                            width: '85%'
                        }}
                    >

                    </View>
                </View>
                <View style={{height: '15%', flexDirection: 'row'}}>
                    <View style={{width: '15%', marginRight: responsiveWidth(2)}}/>
                    <View style={{flexDirection: 'row', width: '85%', justifyContent: 'space-between'}}>
                        {
                            data?.names?.map((val, index) => {
                                return (
                                    <Text
                                        style={{
                                            width: '15%',
                                            color: 'black',
                                            fontSize: 13,
                                            fontWeight: '500',
                                            flexWrap: 'wrap'
                                        }}
                                        key={index}
                                    >{val}</Text>
                                );
                            })
                        }
                    </View>
                </View>
            </View>
        </View>
    )
}

export default BarGraph

const styles = StyleSheet.create({})