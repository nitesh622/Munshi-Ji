import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import Loader from '../../Components/Loader';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import PopUpMessage from '../../Components/PopUpMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OtpVerify = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['-1', '-1', '-1', '-1', '-1', '-1']);
  const inputRef1 = useRef();
  const inputRef2 = useRef();
  const inputRef3 = useRef();
  const inputRef4 = useRef();
  const inputRef5 = useRef();
  const inputRef6 = useRef();
  const route = useRoute();
  const {name, shopName, phoneNo, login, uId} = route.params;
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertMessageType, setAlertMessageType] = useState(false);

  const handleAlertMessage = async (message, type) => {
    setShowAlert(true);
    setAlertMessage(message)
    setAlertMessageType(type);
    setTimeout(()=>{setShowAlert(false)}, 2000)
  }

  const handleUserSignUp = async () => {
    const newUserData = {
      name: name,
      businessName: shopName,
      contact: phoneNo
    }

    try {
      const userSignUpRes = await fetch('https://khata-hl62.onrender.com/api/v1/user/signup', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUserData)
      });

      const userSignUpData = await userSignUpRes.json();
      return userSignUpData.data.user._id;
    }
    catch(err) {
      setLoading(false);
      await handleAlertMessage('User already exist!\nPlease Login!!', false)
      return null;
    }
  }

  const handleOtpVerify = async () => {
    console.log(otp);
    let finalOtp = '';
    for(let i=0; i<6; i++) {
      if(otp[i]>='0' && otp[i]<='9') {
        finalOtp += otp[i];
      }
    }
    
    if(finalOtp.length < 6) {
      console.log('Not a valid otp');
      await handleAlertMessage('Phone enter a valid OTP\nIt should contain only numbers!', false)
      return;
    }
    
    setLoading(true);
    const verifyOtp = {
      number: phoneNo,
      code: finalOtp
    }
    try {
      const verifyOtpRes = await fetch('https://khata-hl62.onrender.com/api/v1/authentication/verifyOTP', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verifyOtp)
      });

      const verifyOtpData = await verifyOtpRes.json();
      console.log(verifyOtpData);
      
      if(verifyOtpData.status == "success") {
        let userId = null
        if(login) {
          userId = uId;
        }
        else {
          userId = await handleUserSignUp()
        }

        if(userId == null) {
          setLoading(false);
          return;
        }
        
        console.log(userId);
        await AsyncStorage.setItem('userId', userId);

        const tokenGenRes = await fetch('https://khata-hl62.onrender.com/api/v1/authentication/genToken', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({id:userId})
        });
  
        const tokenGenData = await tokenGenRes.json();

        if(tokenGenData.status == "success") {
          await AsyncStorage.setItem('token', tokenGenData.token);
          setLoading(false);
          await handleAlertMessage('User Verified Successfully!\nWelcome to Munshi Ji', true)
          setTimeout(() => {
            navigation.navigate('BottomNavigation');
          }, 1000)
        }
        else {
          setLoading(false);
          await handleAlertMessage('Some Error Occured!', false)
        }
      }
      else {
        setLoading(false);
        await handleAlertMessage('Incorrect OTP!', false)
      }
    } 
    catch (err) {
      console.log(err);
      setLoading(false);
      await handleAlertMessage('Some Error Occured!', false)
    }
  };

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
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: responsiveHeight(3),
        }}>
        <Image
          source={require('../../assets/otp.png')}
          style={{
            height: responsiveHeight(18),
            width: responsiveHeight(18),
          }}
        />
        <View
          style={{
            borderBottomWidth: 2,
            marginTop: responsiveHeight(2),
            width: responsiveWidth(45),
          }}
        />
      </View>
      <View style={{marginBottom: 30}}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: 'black',
            textAlign: 'center',
          }}>
          {'Sent to your mobile number ******' + phoneNo.substring(6)}
        </Text>
      </View>
      <View style={{width: '100%', marginBottom: responsiveHeight(2)}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
          }}>
          <TextInput
            style={styles.input}
            onChangeText={text => {}}
            maxLength={1}
            keyboardType="phone-pad"
            ref={inputRef1}
            onKeyPress={key => {
              const keyVal = key.nativeEvent.key;
              if (keyVal == 'Backspace') {
                if (otp[0] != '-1') {
                  setOtp(otp => {
                    otp[0] = '-1';
                    return otp;
                  });
                  inputRef1.current.setNativeProps({text: ''});
                }
              }
              else {
                setOtp(otp => {
                  otp[0] = keyVal;
                  return otp;
                });
                inputRef1.current.setNativeProps({text: keyVal});
                inputRef2.current.focus();
              }
            }}
            autoComplete='off'
          />
          <TextInput
            style={styles.input}
            onChangeText={text => {}}
            maxLength={1}
            keyboardType="phone-pad"
            ref={inputRef2}
            onKeyPress={key => {
              const keyVal = key.nativeEvent.key;
              if (keyVal == 'Backspace') {
                if (otp[1] != '-1') {
                  setOtp(otp => {
                    otp[1] = '-1';
                    return otp;
                  });
                  inputRef2.current.setNativeProps({text: ''});
                } 
                else {
                  inputRef1.current.focus();
                }
              } 
              else {
                setOtp(otp => {
                  otp[1] = keyVal;
                  return otp;
                });
                inputRef2.current.setNativeProps({text: keyVal});
                inputRef3.current.focus();
              }
            }}
          />
          <TextInput
            style={styles.input}
            onChangeText={text => {}}
            maxLength={1}
            keyboardType="phone-pad"
            ref={inputRef3}
            onKeyPress={key => {
              const keyVal = key.nativeEvent.key;
              if (keyVal == 'Backspace') {
                if (otp[2] != '-1') {
                  setOtp(otp => {
                    otp[2] = '-1';
                    return otp;
                  });
                  inputRef3.current.setNativeProps({text: ''});
                } 
                else {
                  inputRef2.current.focus();
                }
              } 
              else {
                setOtp(otp => {
                  otp[2] = keyVal;
                  return otp;
                });
                inputRef3.current.setNativeProps({text: keyVal});
                inputRef4.current.focus();
              }
            }}
          />
          <TextInput
            style={styles.input}
            onChangeText={text => {}}
            maxLength={1}
            keyboardType="phone-pad"
            ref={inputRef4}
            onKeyPress={key => {
              const keyVal = key.nativeEvent.key;
              if (keyVal == 'Backspace') {
                if (otp[3] != '-1') {
                  setOtp(otp => {
                    otp[3] = '-1';
                    return otp;
                  });
                  inputRef4.current.setNativeProps({text: ''});
                } 
                else {
                  inputRef3.current.focus();
                }
              } 
              else {
                setOtp(otp => {
                  otp[3] = keyVal;
                  return otp;
                });
                inputRef4.current.setNativeProps({text: keyVal});
                inputRef5.current.focus();
              }
            }}
          />
          <TextInput
            style={styles.input}
            onChangeText={text => {}}
            maxLength={1}
            keyboardType="phone-pad"
            ref={inputRef5}
            onKeyPress={key => {
              const keyVal = key.nativeEvent.key;
              if (keyVal == 'Backspace') {
                if (otp[4] != '-1') {
                  setOtp(otp => {
                    otp[4] = '-1';
                    return otp;
                  });
                  inputRef5.current.setNativeProps({text: ''});
                } 
                else {
                  inputRef4.current.focus();
                }
              } 
              else {
                setOtp(otp => {
                  otp[4] = keyVal;
                  return otp;
                });
                inputRef5.current.setNativeProps({text: keyVal});
                inputRef6.current.focus();
              }
            }}
          />
          <TextInput
            style={styles.input}
            onChangeText={text => {}}
            maxLength={1}
            keyboardType="phone-pad"
            ref={inputRef6}
            onKeyPress={key => {
              const keyVal = key.nativeEvent.key;
              if (keyVal == 'Backspace') {
                if (otp[5] != '-1') {
                  setOtp(otp => {
                    otp[5] = '-1';
                    return otp;
                  });
                  inputRef6.current.setNativeProps({text: ''});
                } 
                else {
                  inputRef5.current.focus();
                }
              } 
              else {
                setOtp(otp => {
                  otp[5] = keyVal;
                  return otp;
                });
                inputRef6.current.setNativeProps({text: keyVal});
              }
            }}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          handleOtpVerify();
        }}>
        <Text style={styles.buttonTitle}>Verify</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Didn't receive the OTP?</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.footerLink}>Resend OTP</Text>
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
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 5,
  },
  input: {
    height: 40,
    width: 40,
    backgroundColor: '#e4d6ff',
    borderRadius: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
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

export default OtpVerify;
