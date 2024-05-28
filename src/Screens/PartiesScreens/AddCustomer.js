import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import {useFormik} from 'formik';
import * as yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../Components/Loader';
import PopUpMessage from '../../Components/PopUpMessage';

const addCustomerValidationSchema = yup.object().shape({
    name: yup
      .string()
      .required('Name is required'),
    phoneNo: yup
      .string()
      .required('Phone No. is required')
      .matches(/^\d{10}$/, 'Enter a valid phone no.')
});

const AddCustomer = () => {
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    const navigation = useNavigation();
    const route = useRoute();
    const {getCustomersData, userId} = route.params;
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageType, setAlertMessageType] = useState(false);

    const handleAlertMessage = async (message, type) => {
        setShowAlert(true);
        setAlertMessage(message)
        setAlertMessageType(type);
        setTimeout(()=>{setShowAlert(false)}, 2000)
    }

    const handleAddCustomer = async ({name, phoneNo}) => {
        setLoading(true);
        const newCustomerData = {
            name: name,
            contact: phoneNo,
            user: userId
        }

        try {
            const res = await fetch('https://khata-hl62.onrender.com/api/v1/customer/add', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCustomerData)
            });
            
            const data = await res.json();
            
            if(data.status == "success") {
                await getCustomersData();
                setLoading(false);
                handleAlertMessage('Customer Added Successfully!', true)
                setTimeout(()=>{navigation.goBack()}, 500)
            }
            else {
                setLoading(false);
                handleAlertMessage('Customer with this number already exist!', false)
            }
        }
        catch(err) {
            console.log(err);
            setLoading(false);
            handleAlertMessage('Some Error Occured!', false)
        }
    }

    const customerFormik = useFormik({
        enableReinitialize: true,
        initialValues: {
          name: '',
          phoneNo: ''
        },
        validationSchema: addCustomerValidationSchema,
        onSubmit: handleAddCustomer,
    });

    return (
        <View style={{flex: 1, backgroundColor: '#F5F5F5', marginTop: 20, justifyContent: 'space-between'}}>
            <Loader isOpen={loading}/>
            <PopUpMessage isOpen={showAlert} message={alertMessage} success={alertMessageType}/>
            <View style={{paddingHorizontal: 10}}>
                <View>
                    <Text
                        style={styles.inputBoxHeadingText}
                    >
                        {"Name"}
                    </Text>
                    <View>
                        <TextInput
                            placeholder="Enter Name"
                            style={styles.inputBox}
                            onChangeText={customerFormik.handleChange('name')}
                            onBlur={customerFormik.handleBlur('name')}
                            value={customerFormik.values.name}
                        />
                        {!customerFormik.isValid && (
                            <Text style={{color: 'red'}}>
                                {customerFormik.errors.name}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={{marginTop: 20}}>
                    <Text
                        style={styles.inputBoxHeadingText}
                    >
                        {"Phone Number"}
                    </Text>
                    <View>
                        <TextInput
                            placeholder="Enter Phone Number"
                            style={styles.inputBox}
                            onChangeText={customerFormik.handleChange('phoneNo')}
                            onBlur={customerFormik.handleBlur('phoneNo')}
                            value={customerFormik.values.phoneNo}
                            keyboardType='phone-pad'
                            maxLength={10}
                        />
                        {!customerFormik.isValid && (
                            <Text style={{color: 'red'}}>
                                {customerFormik.errors.phoneNo}
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            <TouchableOpacity 
                style={{
                    padding: 10,
                    width: screenWidth*0.95,
                    backgroundColor: '#9900F0',
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',
                    marginBottom: 20,
                }}
                onPress={()=>{
                    customerFormik.handleSubmit(customerFormik.values.name, customerFormik.values.phoneNo)
                }}
            >
                <Text style={{fontSize: 17, color: 'white', fontWeight: 'bold'}}>{'Add Customer'}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default AddCustomer

const styles = StyleSheet.create({
    inputBoxHeadingText: {
        alignItems: 'center',
        color: '#211951',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        letterSpacing: 1
    },
    inputBox: {
        alignItems: 'center',
        backgroundColor: 'white',
        fontSize: 16,
        borderColor: '#DDDDDD',
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 10,
    }
})