import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
  Image,
  ScrollView
} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFormik} from 'formik';
import * as yup from 'yup';
import {useNavigation} from '@react-navigation/native';
import Loader from '../../Components/Loader';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import PopUpMessage from '../../Components/PopUpMessage';

const loginValidationSchema = yup.object().shape({
  phoneNo: yup
    .string()
    .required('Phone No. is required')
    .matches(/^\d{10}$/, 'Enter a valid phone no.'),
});

const Login = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertMessageType, setAlertMessageType] = useState(false);

  const handleLogin = async ({phoneNo}) => {
    setLoading(true);

    try {
      const numberCheckRes = await fetch('https://khata-hl62.onrender.com/api/v1/authentication/loginCheck', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({number: phoneNo})
      });

      const numberCheckData = await numberCheckRes.json();
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
          navigation.navigate('OtpVerify', {phoneNo: phoneNo, login: true, uId: numberCheckData.id});
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
        setAlertMessage('User not found!\nPlease Sign up first!!')
        setAlertMessageType(false);
        setTimeout(()=>{setShowAlert(false)}, 2000)
      }
      console.log(numberCheckData);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setShowAlert(true);
      setAlertMessage('Some Error Occured!')
      setAlertMessageType(false);
      setTimeout(()=>{setShowAlert(false)}, 2000)
    }
  };

  const loginFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      phoneNo: ''
    },
    validationSchema: loginValidationSchema,
    onSubmit: handleLogin,
  });

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      style={{flex: 1, backgroundColor: '#FFFFFF'}} 
      showsVerticalScrollIndicator={false} 
      showsHorizontalScrollIndicator={false}
    >
      <Loader isOpen={loading} />
      <PopUpMessage isOpen={showAlert} message={alertMessage} success={alertMessageType}/>
      <View
        style={{
          height: responsiveHeight(18),
          width: responsiveHeight(18),
          borderRadius: 100,
          // backgroundColor: '#eee5ff',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: responsiveHeight(2.5),
        }}>
        <Image
          source={require('../../assets/khataLogo.png')}
          style={{
            height: responsiveHeight(20),
            width: responsiveHeight(20),
          }}
        />
      </View>
      <Text style={styles.title}>Welcome to Khata</Text>
      <View
        style={{
          // borderBottomWidth: 2,
          marginTop: responsiveHeight(1),
          marginBottom: responsiveHeight(3),
          // width: responsiveWidth(50),
          // borderStyle: 'dashed'
        }}
      />
      {/* <Text style={{fontSize: 20, fontWeight: '500', color: 'black', marginBottom: responsiveHeight(1.5)}}>Enter Phone Number</Text> */}
      <View style={{width: '100%', marginBottom: responsiveHeight(4)}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 48,
            width: '100%',
            borderRadius: 10,
            backgroundColor: '#eee5ff',
            paddingLeft: 10,
          }}>
          <Image
            source={require('../../assets/phoneNumber.png')}
            style={{height: 20, width: 20}}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone No."
            onChangeText={loginFormik.handleChange('phoneNo')}
            onBlur={loginFormik.handleBlur('phoneNo')}
            value={loginFormik.values.phoneNo}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
        {!loginFormik.isValid &&
        loginFormik.errors &&
        loginFormik.errors.phoneNo ? (
          <Text style={{color: 'red'}}>{loginFormik.errors.phoneNo}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          loginFormik.handleSubmit(
            loginFormik.values.phoneNo,
          );
        }}>
        <Text style={styles.buttonTitle}>Login</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => {navigation.navigate('SignUp')}}>
          <Text style={styles.footerLink}>Sign up</Text>
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
    // marginBottom: 30,
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
    // marginTop: 20,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 20,
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
    fontWeight: '500',
  },
  inputBoxHeadingText: {
    alignItems: 'center',
    color: '#211951',
    fontSize: 18,
    fontWeight: 'bold',
    // marginBottom: 5,
    letterSpacing: 1,
  },
});

export default Login;
