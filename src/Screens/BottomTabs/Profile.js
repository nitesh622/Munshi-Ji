import { StyleSheet, Text, View, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../Components/Loader';
import PopUpMessage from '../../Components/PopUpMessage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, CommonActions } from '@react-navigation/native';

const Profile = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertMessageType, setAlertMessageType] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const navigation = useNavigation();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('token');
      setTimeout(()=>{
        setLoading(false);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {name: 'Login'}
            ]
          })
        );
      }, 1000)
    }
    catch(err) {
      setLoading(false);
      handleAlertMessage('Some error occured!', false);
    }
  }

  const handleAlertMessage = async (message, type) => {
    setShowAlert(true);
    setAlertMessage(message)
    setAlertMessageType(type);
    setTimeout(()=>{setShowAlert(false)}, 2000)
  }

  const getUserId = async () => {
    try {
      const value = await AsyncStorage.getItem('userId');
      if(value !== null) {
        setUserId(value);
        return value;
      }
      else {
        console.log('user id not found')
        return null
      }
    }
    catch(err) {
      console.log(err);
      handleAlertMessage('No Data Found!', false)
      return null
    }
  }

  const getUserData = async () => {
    let uId = userId;
    if(uId == null) {
      uId = await getUserId();
    }
    setLoading(true);

    try {
      const res = await fetch(`https://khata-hl62.onrender.com/api/v1/user/get/${uId}`)
      const data = await res.json();

      setLoading(false);
      if(data.message == "success") {
        const tempData = data.data;
        setUserDetails({
          name: tempData.name,
          phoneNo: tempData.contact,
          businessName: tempData.businessName,
          photoUrl: tempData.photo
        })
      }
      else {
        handleAlertMessage('No Data Found!', false)
      }
    }
    catch(err) {
      console.log(err);
      setLoading(false);
      handleAlertMessage('No Data Found!', false)
    }
  }

  useEffect(() => {
    getUserId();
    getUserData();
  }, [])

  const handleRefreshing = async () => {
    setRefreshing(true);
    getUserData();
    setRefreshing(false);
  }
  // #d7c2ff
  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      style={{flex: 1, backgroundColor: '#F5F5F5'}} 
      showsVerticalScrollIndicator={false} 
      showsHorizontalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing}
          onRefresh={() => {handleRefreshing()}}
        />
      }
    >
      <Loader isOpen={loading}/>
      <PopUpMessage isOpen={showAlert} message={alertMessage} success={alertMessageType}/>
      <View 
        style={{
          backgroundColor: '#D8B4F8', 
          width: responsiveWidth(100), 
          flexDirection: 'row', 
          paddingTop: responsiveHeight(5), 
          paddingHorizontal: responsiveWidth(3), 
          paddingBottom: responsiveHeight(2), 
          alignItems: 'center', 
          elevation: 15
        }}
      >
        <Image
          source={require('../../assets/personProfile.png')}
          style={{height: responsiveHeight(12), width: responsiveHeight(12)}}
        />
        <View style={{marginLeft: responsiveWidth(3)}}>
          <Text style={{fontSize: 22,fontWeight: 'bold',color: '#211951', letterSpacing: 1}}>{userDetails?.name}</Text>
          <Text style={{fontSize: 15,fontWeight: '600',color: '#211951',}}>{'Shop Name: ' + userDetails?.businessName}</Text>
          <Text style={{fontSize: 15,fontWeight: '600',color: '#211951',}}>{'Phone No: ' + userDetails?.phoneNo}</Text>
        </View>
      </View>

      <View style={{marginTop: responsiveHeight(3)}}>
        <TouchableOpacity
          style={styles.btnStyle}
          onPress={()=>{}}
        >
          <Ionicons name='notifications-outline' size={25} color={'#9900F0'}/>
          <Text
            style={styles.btnTextStyle}>
            {'Notifications'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnStyle}
          onPress={()=>{}}
        >
          <Ionicons name='settings-outline' size={25} color={'#9900F0'}/>
          <Text
            style={styles.btnTextStyle}>
            {'Settings'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnStyle}
          onPress={()=>{}}
        >
          <Ionicons name='help-circle-outline' size={27} color={'#9900F0'}/>
          <Text
            style={styles.btnTextStyle}>
            {'Help & Support'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnStyle}
          onPress={()=>{}}
        >
          <MaterialCommunityIcons name='information-outline' size={25} color={'#9900F0'}/>
          <Text
            style={styles.btnTextStyle}>
            {'About Us'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnStyle}
          onPress={()=>{handleLogout()}}
        >
          <MaterialIcons name='logout' size={25} color={'#9900F0'}/>
          <Text
            style={styles.btnTextStyle}>
            {'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center'
  },
  btnStyle: {
    height: responsiveHeight(7),
    width: responsiveWidth(95),
    flexDirection: 'row',
    marginBottom: responsiveHeight(2),
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(4),
    elevation: 2,
    backgroundColor: 'white',
    alignItems: 'center'
  },
  btnTextStyle: {
    fontSize: 18,
    color: '#211951',
    fontWeight: '500',
    marginLeft: responsiveWidth(3),
    letterSpacing: 0.5,
  }
})