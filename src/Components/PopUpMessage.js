import {View, Modal, Animated, Text, Image} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

const PopUpMessage = ({isOpen, message, success}) => {
    if(!isOpen) return;
    const animation = useRef(new Animated.Value(0)).current;
    const [showAlert, setShowAlert] = useState(true);
    const startAnimation = () => {
        Animated.spring(animation, {
            toValue: showAlert ? 1 : -2,
            useNativeDriver: true,
        }).start();
    }

    setTimeout(() => {setShowAlert(false)}, 1500)

    useEffect(()=>{
        startAnimation()
    }, [showAlert])

    return (
        <Animated.View 
            style={[{
                // height: responsiveHeight(10), 
                width: responsiveWidth(90),
                alignSelf: 'center', 
                borderRadius: 15,
                position: 'absolute',
                top: 0,
                zIndex: 2,
                backgroundColor: '#ECF2FF'
            }, {
                transform: [{
                    translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 40]
                    })
                }],
            }]}
        >
            <View style={{height: '100%', width: '100%', flexDirection: 'row', alignItems: 'center', padding: responsiveHeight(2)}}>
                <View
                    style={{height: responsiveHeight(5), width: responsiveHeight(5),}}
                >
                    <Image 
                        source={
                            success
                            ? require('../assets/success.png')
                            : require('../assets/warning.png')
                        }
                        style={{height: '100%', width: '100%'}}
                    />
                </View>
                <View style={{marginLeft: responsiveWidth(2), width: responsiveWidth(70)}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold', color: 'black'}}>{success ? 'Success' : 'Warning'}</Text>
                    <Text style={{fontSize: 14, color: 'black', flexWrap: 'wrap', fontWeight: '500'}}>{message}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

export default PopUpMessage;
