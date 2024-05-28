import {StyleSheet, Text, View, Image} from 'react-native';
import React, {useEffect} from 'react';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
    const navigation = useNavigation();
    const getAuthState = async () => {
        try {
            const value = await AsyncStorage.getItem('token');
            if(value !== null) {
                const verifyTokenRes = await fetch('https://khata-hl62.onrender.com/api/v1/authentication/verifyToken', {
                    method: 'post',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({token: value})
                });
            
                const verifyTokenData = await verifyTokenRes.json();
                if(verifyTokenData.status == "success") {
                    navigation.replace('BottomNavigation')
                }
                else {
                    navigation.replace('Login')
                }
            }
            else {
                console.log('No data found for key: ', 'token');
                navigation.replace('Login')
            }
        } 
        catch (error) {
            console.error('Error retrieving data:', error);
            navigation.replace('Login')
        }
    }

    useEffect(()=>{
        getAuthState();
    }, [])

    return (
        <View style={styles.container}>
            <View>
                <Image
                    resizeMode="contain"
                    source={require('../assets/khataLogo.png')}
                    style={{width: responsiveWidth(85), height: responsiveHeight(30)}}
                />
            </View>
            <Text style={{
                fontFamily: 'RedHatDisplay-Regular',
                color: '#9900F0',
                fontSize: responsiveFontSize(4),
                marginTop: responsiveHeight(2),
                letterSpacing: 1,
                fontWeight: 'bold'
            }}>
                {"Munshi Ji"}
            </Text>
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
});
