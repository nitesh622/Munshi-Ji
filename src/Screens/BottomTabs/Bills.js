import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
  Modal,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {Dropdown} from 'react-native-element-dropdown';
import {useNavigation} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo'
import Loader from '../../Components/Loader';
import PopUpMessage from '../../Components/PopUpMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const Bills = () => {
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const [inputBillId, setInputBillId] = useState('');
  const [openUserTypeModal, setOpenUserTypeModal] = useState(false);
  const navigation = useNavigation();
  const [allBillsData, setAllBillsData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertMessageType, setAlertMessageType] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const formatDate = (date) => {
    var dd = date.getDate();
    var mm = date.getMonth();
    var yyyy = date.getYear();
    if(dd<10) {dd='0'+dd}
    const newFormat = dd+' '+monthNames[mm]+' '+(yyyy%100);
    return newFormat;
  }

  const getBillsData = async () => {
    let uId = userId;
    if(uId == null) {
      uId = await getUserId();
    }
    setLoading(true);
    try {
      const res = await fetch(`https://khata-hl62.onrender.com/api/v1/customerBill/findBills?user=${uId}`)
      const data = await res.json();
      
      if(data.status == "success") {
        const dataArr = data.data;
        let tempArr = []
        await Promise.all(dataArr.map(
          ({_id, amount, transactionDate}) => {
            const date = new Date(transactionDate);
            const newFormat = formatDate(date);
            tempArr.push({
              totalAmount: amount,
              date: newFormat,
              billId: _id
            })
          }
        ))

        setLoading(false);
        setAllBillsData(tempArr)
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
    getBillsData();
  }, []);

  const handleRefreshing = async () => {
    setRefreshing(true);
    getBillsData();
    setRefreshing(false);
  }

  return (
    <View style={{flex: 1, backgroundColor: '#F5F5F5', marginTop: 40}}>
      <Loader isOpen={loading}/>
      <PopUpMessage isOpen={showAlert} message={alertMessage} success={alertMessageType}/>
      <View style={{paddingHorizontal: 10}}>
        <Text
          style={{
            fontSize: 22,
            paddingVertical: 10,
            fontWeight: 'bold',
            color: '#211951',
          }}>
          {'Search a bill'}
        </Text>
        <View
          style={{
            width: screenWidth * 0.95,
            flexDirection: 'row',
            backgroundColor: 'white',
            alignItems: 'center',
            borderWidth: 1,
            paddingHorizontal: 15,
            borderColor: '#DDDDDD',
            borderRadius: 10,
          }}>
          <Icon name="search" size={26} color="#9900F0" />
          <TextInput
            placeholder="Enter Bill ID"
            style={{fontSize: 16, paddingLeft: 10}}
            value={inputBillId}
            onChangeText={text => setInputBillId(text)}
          />
        </View>
      </View>

      <View style={{marginTop: 20, paddingHorizontal: 15}}>
        <ScrollView
          style={{height: screenHeight * 0.77}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={() => {handleRefreshing()}}
            />
          }
        >
          {allBillsData.map(({billId, date, totalAmount}, index) => {
            return (
              <TouchableOpacity
                style={{
                  height: screenHeight * 0.1,
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  paddingVertical: 5,
                  alignItems: 'center',
                  elevation: 2,
                  backgroundColor: 'white',
                }}
                key={index}
                onPress={() => {navigation.navigate('BillDetails', {userId: userId, billId: billId})}}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      color: '#211951',
                      fontWeight: '500',
                      marginBottom: 5,
                    }}>
                    {'Bill ID: ' + billId.substring(0, 10) + '.....'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#868686',
                    }}>
                    {'Date: ' + date}
                  </Text>
                </View>
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#211951',
                    }}>
                    {'Total'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#211951',
                      fontWeight: 'bold',
                    }}>
                    {'₹ ' + totalAmount}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={{
          position: 'absolute',
          height: screenHeight * 0.05,
          width: screenWidth * 0.4,
          bottom: 10,
          right: 10,
          backgroundColor: '#9900F0',
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => { 
          // setOpenUserTypeModal(true)
          navigation.navigate('CreateBill', {getBillsData, getBillsData, userId: userId});
        }}
      >
        <Text
          style={{
            fontSize: 17,
            color: 'white',
            fontWeight: 'bold',
            letterSpacing: 1,
          }}>
          {'+  Create Bill'}
        </Text>
      </TouchableOpacity>

      <Modal 
        visible={openUserTypeModal} 
        transparent={true}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'grey',
            opacity: 0.5,
          }}
        />
        <View
          style={{
            position: 'absolute',
            padding: 20,
            width: screenWidth*0.75,
            alignSelf: 'center',
            top: `35%`,
            borderRadius: 10,
            backgroundColor: 'white',
            elevation: 5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TouchableOpacity 
            style={{position: 'absolute', top: 10, right: 10}}
            onPress={() => {setOpenUserTypeModal(false)}}
          >
            <Entypo name='cross' size={25} color={'black'}/>
          </TouchableOpacity>
          <Text 
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: '#211951',
              marginBottom: 15,
            }}
          >
            {"Create bill for"}
          </Text>
          <TouchableOpacity 
            onPress={()=>{
              setOpenUserTypeModal(false)
              navigation.navigate('AddCustomer')
            }}
            style={{
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 5,
              backgroundColor: '#9900F0',
              width: '80%',
              marginBottom: 15
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '500',
                color: 'white'
              }}
            >
              {"New User"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={()=>{}}
            style={{
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 5,
              backgroundColor: '#e4d6ff',
              width: '80%'
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '500',
                color: 'black'
              }}
            >
              {"Existing User"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Bills;

const styles = StyleSheet.create({
  topSelectionButton: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  topSelectionButtonText: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
  },
});
