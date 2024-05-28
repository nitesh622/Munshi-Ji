import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, ScrollView, } from 'react-native'
import React, { useState, useEffect } from 'react';
import {useFormik} from 'formik';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import Loader from '../../Components/Loader';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import PopUpMessage from '../../Components/PopUpMessage';

const signUpValidationSchema = yup.object().shape({
    name: yup
      .string()
      .required('Name is required'),
    shopName: yup
      .string()
      .required('Shop Name is required'),
    phoneNo: yup
      .string()
      .required('Phone No. is required')
      .matches(/^\d{10}$/, 'Enter a valid phone no.')
});

const SignUp = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageType, setAlertMessageType] = useState(false);
    
    const handleSignUp = async ({name, shopName, phoneNo}) => {
        setLoading(true);

        try {
            const numberCheckRes = await fetch('https://khata-hl62.onrender.com/api/v1/authentication/signupCheck', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({number: phoneNo})
            });

            const numberCheckData = await numberCheckRes.json();
            console.log(numberCheckData);

            if(numberCheckData.status == "success") {
                const otpRes = await fetch('https://khata-hl62.onrender.com/api/v1/authentication/getOTP', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({number: phoneNo})
                });
    
                const otpData = await otpRes.json();
                setLoading(false);
                console.log(otpData);
                if(otpData.status == "success") {
                    navigation.navigate('OtpVerify', {name: name, shopName: shopName, phoneNo: phoneNo, login: false});
                }
                else {
                    setShowAlert(true);
                    setAlertMessage('Some Error Occured!')
                    setAlertMessageType(false);
                    setTimeout(()=>{setShowAlert(false)}, 2000)
                }
            }
            else {
                setLoading(false);
                setShowAlert(true);
                setAlertMessage('Phone number already exist!\nPlease Login!!')
                setAlertMessageType(false);
                setTimeout(()=>{setShowAlert(false)}, 2000)
            }
        }
        catch(err) {
            console.log(err);
            setLoading(false);
            setShowAlert(true);
            setAlertMessage('Some Error Occured!')
            setAlertMessageType(false);
            setTimeout(()=>{setShowAlert(false)}, 2000)
        }
    }

    const userFormik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: '',
            shopName: '',
            phoneNo: ''
        },
        validationSchema: signUpValidationSchema,
        onSubmit: handleSignUp,
    });

    return (
        <ScrollView 
            contentContainerStyle={styles.container} 
            style={{flex: 1, backgroundColor: '#FFFFFF'}} 
            showsVerticalScrollIndicator={false} 
            showsHorizontalScrollIndicator={false}
        >
            <Loader isOpen={loading}/>
            <PopUpMessage isOpen={showAlert} message={alertMessage} success={alertMessageType}/>
            <View 
                style={{
                    height: responsiveHeight(17), 
                    width: responsiveHeight(17),
                    borderRadius: 100,
                    backgroundColor: '#eee5ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: responsiveHeight(2),
                }}
            >
                <Image 
                    source={require('../../assets/privacy.png')} 
                    style={{
                        height: responsiveHeight(18), 
                        width: responsiveHeight(18), 
                        marginLeft: responsiveHeight(5)
                    }}
                />
            </View>
            <Text style={styles.title}>Create an Account</Text>
            <View style={{width: '100%', marginBottom: 30}}>
                <View 
                    style={{
                        flexDirection: 'row', 
                        alignItems: 'center',
                        height: 48,
                        width: '100%',
                        borderRadius: 10,
                        backgroundColor: '#eee5ff',
                        paddingLeft: 10,
                    }}
                >
                    <Image 
                        source={require('../../assets/userName.png')} 
                        style={{height: 20, width: 20}}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        onChangeText={userFormik.handleChange('name')}
                        onBlur={userFormik.handleBlur('name')}
                        value={userFormik.values.name}
                    />
                </View>
                {!userFormik.isValid && userFormik.errors && userFormik.errors.name ? (
                    <Text style={{color: 'red'}}>
                        {userFormik.errors.name}
                    </Text>
                ) : null}
            </View>
            <View style={{width: '100%', marginBottom: 30}}>
                <View 
                    style={{
                        flexDirection: 'row', 
                        alignItems: 'center',
                        height: 48,
                        width: '100%',
                        borderRadius: 10,
                        backgroundColor: '#eee5ff',
                        paddingLeft: 10,
                    }}
                >
                    <Image 
                        source={require('../../assets/shopName.png')} 
                        style={{height: 20, width: 20}}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Shop Name"
                        onChangeText={userFormik.handleChange('shopName')}
                        onBlur={userFormik.handleBlur('shopName')}
                        value={userFormik.values.shopName}
                    />
                </View>
                {!userFormik.isValid && userFormik.errors && userFormik.errors.shopName ? (
                    <Text style={{color: 'red'}}>
                        {userFormik.errors.shopName}
                    </Text>
                ) : null}
            </View>
            <View style={{width: '100%', marginBottom: 30}}>
                <View 
                    style={{
                        flexDirection: 'row', 
                        alignItems: 'center',
                        height: 48,
                        width: '100%',
                        borderRadius: 10,
                        backgroundColor: '#eee5ff',
                        paddingLeft: 10,
                    }}
                >
                    <Image 
                        source={require('../../assets/phoneNumber.png')} 
                        style={{height: 20, width: 20}}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Phone No."
                        onChangeText={userFormik.handleChange('phoneNo')}
                        onBlur={userFormik.handleBlur('phoneNo')}
                        value={userFormik.values.phoneNo}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                </View>
                {!userFormik.isValid && userFormik.errors && userFormik.errors.phoneNo ? (
                    <Text style={{color: 'red'}}>
                        {userFormik.errors.phoneNo}
                    </Text>
                ) : null}
            </View>
            <TouchableOpacity style={styles.button} onPress={()=>{
                userFormik.handleSubmit(userFormik.values.name, userFormik.values.shopName, userFormik.values.phoneNo)
            }}>
                <Text style={styles.buttonTitle}>Sign up</Text>
            </TouchableOpacity>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => {navigation.goBack()}}>
                <Text style={styles.footerLink}>Log in</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: responsiveWidth(10),
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        overflow: 'hidden',
        paddingLeft: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#9900F0',
        width: '100%',
        height: 48,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    buttonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    footer: {
        marginTop: 30,
        flexDirection: 'row',
    },
    footerText: {
        color: '#333333',
        fontSize: 16,
    },
    footerLink: {
        color: '#9900F0',
        marginLeft: 5,
        fontSize: 16,
        fontWeight: '500'
    },
    inputBoxHeadingText: {
        alignItems: 'center',
        color: '#211951',
        fontSize: 18,
        fontWeight: 'bold',
        // marginBottom: 5,
        letterSpacing: 1
    },
});

export default SignUp;