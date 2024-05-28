import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';
import Loader from '../../Components/Loader';
import PopUpMessage from '../../Components/PopUpMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Parties = () => {
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const [selectedScreen, setSelectedScreen] = useState('Customer');
  const [totalCustomerAmount, setTotalCustomerAmount] = useState(0);
  const [pendingCustomerAmount, setPendingCustomerAmount] = useState(0);
  const [allCustomersData, setAllCustomersData] = useState([]);
  const [totalSupplierAmount, setTotalSupplierAmount] = useState(0);
  const [pendingSupplierAmount, setPendingSupplierAmount] = useState(0);
  const [allSupplierData, setAllSupplierData] = useState([]);
  const [customersData, setCustomersData] = useState([]);
  const [searchFilterChoice, setSearchFilterChoice] = useState(false);
  const [searchCustomerValue, setSearchCustomerValue] = useState('');
  const [searchSupplierValue, setSearchSupplierValue] = useState('');
  const navigation = useNavigation();
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

  const getSuppliersData = async () => {
    let uId = userId;
    if(uId == null) {
      uId = await getUserId();
    }
    setLoading(true);

    try {
      const res = await fetch(`https://khata-hl62.onrender.com/api/v1/supplier/findSuppliers/${uId}`)
      const data = await res.json();
      
      if(data.status == "success") {
        const dataArr = data.data;
        let tempArr = []
        let tempTotal = 0
        let tempPending = 0;
        await Promise.all(dataArr.map(
          ({id, contact, name, pendingAmount, totalBusiness}) => {
            tempArr.push({
              supplierId: id,
              name: name,
              phoneNo: contact,
              totalAmount: totalBusiness,
              pendingAmount: pendingAmount,
            })

            tempTotal += totalBusiness
            tempPending += pendingAmount
          }
        ))

        setLoading(false);
        setAllSupplierData(tempArr)
        setTotalSupplierAmount(tempTotal)
        setPendingSupplierAmount(tempPending)
      }
      else {
        setLoading(false);
        handleAlertMessage('No Data Found!', false)
      }
    }
    catch(err) {
      console.log(err);
      setLoading(false);
      handleAlertMessage('No Data Found!', false)
    }
  }

  const getCustomersData = async () => {
    let uId = userId;
    if(uId == null) {
      uId = await getUserId();
    }
    setLoading(true);
    try {
      const res = await fetch(`https://khata-hl62.onrender.com/api/v1/customer/getforUser/${uId}`)
      const data = await res.json();
      
      if(data.status == "success") {
        const dataArr = data.data;
        let tempArr = []
        let tempTotal = 0
        let tempPending = 0;
        await Promise.all(dataArr.map(
          ({_id, contact, name, pendingAmount, totalBusiness}) => {
            tempArr.push({
              customerId: _id,
              name: name,
              phoneNo: contact,
              totalAmount: totalBusiness,
              pendingAmount: pendingAmount,
            })

            tempTotal += totalBusiness
            tempPending += pendingAmount
          }
        ))

        setLoading(false);
        setAllCustomersData(tempArr)
        setTotalCustomerAmount(tempTotal)
        setPendingCustomerAmount(tempPending)
      }
      else {
        setLoading(false);
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
    getCustomersData();
    getSuppliersData();
  }, [])

  const searchFilterData = [
    {label: 'Name', value: false},
    {label: 'Phone No.', value: true},
  ]

  const tempCustomersData = [
    {
      name: 'Nitesh',
      phoneNo: '3454544544',
      totalAmount: 3432,
      pendingAmount: 233,
    },
    {
      name: 'Jatin',
      phoneNo: '5654544544',
      totalAmount: 1231,
      pendingAmount: 455,
    },
    {
      name: 'Noushil',
      phoneNo: '6575479834',
      totalAmount: 6235,
      pendingAmount: 1334,
    },
    {
      name: 'Aryan',
      phoneNo: '7383233240',
      totalAmount: 4324,
      pendingAmount: 874,
    },
    {
      name: 'Siddhant',
      phoneNo: '8795964693',
      totalAmount: 5394,
      pendingAmount: 3434,
    },
    {
      name: 'Aryan K',
      phoneNo: '8840610256',
      totalAmount: 60000,
      pendingAmount: 1000,
    },
  ];

  const handleRefreshing = async () => {
    setRefreshing(true);
    if(selectedScreen == 'Customer') {
      getCustomersData();
    }
    else {
      getSuppliersData();
    }
    setRefreshing(false);
  }

  return (
    <View style={{flex: 1, backgroundColor: '#F5F5F5', marginTop: 40}}>
      <Loader isOpen={loading}/>
      <PopUpMessage isOpen={showAlert} message={alertMessage} success={alertMessageType}/>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          paddingVertical: 10,
        }}>
        <TouchableOpacity
          style={[
            {
              width: screenWidth * 0.42,
              backgroundColor:
                selectedScreen == 'Customer' ? '#9900F0' : '#e4d6ff',
            },
            styles.topSelectionButton,
          ]}
          onPress={() => {
            setSelectedScreen('Customer');
          }}>
          <Text
            style={[
              {
                color: selectedScreen == 'Customer' ? 'white' : 'black',
              },
              styles.topSelectionButtonText,
            ]}>
            {'Customer'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            {
              width: screenWidth * 0.42,
              backgroundColor:
                selectedScreen == 'Supplier' ? '#9900F0' : '#e4d6ff',
            },
            styles.topSelectionButton,
          ]}
          onPress={() => {
            setSelectedScreen('Supplier');
          }}>
          <Text
            style={[
              {
                color: selectedScreen == 'Supplier' ? 'white' : 'black',
              },
              styles.topSelectionButtonText,
            ]}>
            {'Supplier'}
          </Text>
        </TouchableOpacity>
      </View>

      {
        selectedScreen == 'Customer'
        ? <View>
            <View
              style={{
                height: screenHeight * 0.15,
                width: screenWidth * 0.95,
                flexDirection: 'row',
                borderWidth: 1,
                borderRadius: 10,
                alignSelf: 'center',
                marginTop: 20,
                backgroundColor: 'white',
                borderColor: '#DDDDDD',
              }}>
              <View
                style={{
                  width: '70%',
                  borderRightWidth: 1,
                  borderColor: '#DDDDDD',
                }}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    height: '50%',
                    padding: 10,
                    borderColor: '#DDDDDD',
                  }}>
                  <Text style={{fontSize: 13, color: '#211951'}}>{'Total'}</Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: '#211951',
                      fontWeight: 'bold',
                    }}>
                    {'₹ ' + totalCustomerAmount}
                  </Text>
                </View>
                <View style={{height: '50%', flexDirection: 'row'}}>
                  <View
                    style={{
                      width: '50%',
                      borderRightWidth: 1,
                      padding: 10,
                      borderColor: '#DDDDDD',
                    }}>
                    <Text style={{fontSize: 13, color: '#17b02a'}}>{'Received'}</Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: '#17b02a',
                        fontWeight: 'bold',
                      }}>
                      {'₹ ' + (totalCustomerAmount - pendingCustomerAmount)}
                    </Text>
                  </View>
                  <View style={{width: '50%', padding: 10}}>
                    <Text style={{fontSize: 13, color: '#FFC700'}}>{'Pending'}</Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: '#FFC700',
                        fontWeight: 'bold',
                      }}>
                      {'₹ ' + pendingCustomerAmount}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  width: '30%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                }}>
                <Text style={{fontSize: 16, color: '#211951', fontWeight: 'bold'}}>
                  {' View\nReport'}
                </Text>
                <Text style={{fontSize: 22, color: '#211951', fontWeight: 'bold'}}>
                  {'>'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View 
              style={{
                flexDirection: 'row',
                marginTop: 30,
                width: screenWidth * 0.95,
                alignSelf: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  width: '68%',
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
                  placeholder="Search Customer" 
                  style={{fontSize: 16, paddingLeft: 10}}
                  value={searchCustomerValue}
                  onChangeText={text => setSearchCustomerValue(text)}
                  keyboardType={searchFilterChoice ? 'number-pad' : 'default'}
                />
              </View>
              <View 
                style={{
                  backgroundColor: 'white',
                  width: '30%',
                  borderWidth: 1,
                  borderColor: '#DDDDDD',
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Dropdown
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 10,
                  }}
                  selectedTextStyle={{
                    color: '#9900F0',
                    fontSize: 14,
                    fontWeight: '500',
                  }}
                  itemTextStyle={{
                    color: '#232b3d',
                    fontSize: 14,
                  }}
                  activeColor={'#f5f5f5'}
                  data={searchFilterData}
                  value={searchFilterChoice}
                  labelField="label"
                  valueField="value"
                  onChange={value => {setSearchFilterChoice(value.value)}}
                />
              </View>
            </View>

            <View style={{marginTop: 20, paddingHorizontal: 15}}>
              <ScrollView
                style={{
                  height: screenHeight * 0.56
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl 
                    refreshing={refreshing}
                    onRefresh={() => {handleRefreshing()}}
                  />
                }
              >
                {allCustomersData.map(({name, phoneNo, totalAmount, pendingAmount}, index) => {
                  if(searchFilterChoice) {
                    if(!phoneNo.toLowerCase().includes(searchCustomerValue.toLowerCase())) return;
                  }
                  else {
                    if(!name.toLowerCase().includes(searchCustomerValue.toLowerCase())) return;
                  }

                  return (
                    <TouchableOpacity
                      style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                        borderRadius: 10,
                        alignItems: 'center',
                        elevation: 2,
                        backgroundColor: 'white',
                      }}
                      key={index}
                    >
                      <View style={{width: '70%'}}>
                        <View style={{marginLeft: 15}}>
                          <Text
                            style={{
                              fontSize: 18,
                              color: '#211951',
                              fontWeight: '500',
                            }}>
                            {name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              color: '#868686',
                              letterSpacing: 1,
                            }}>
                            {'Phone No: ' + phoneNo}
                          </Text>
                        </View>
                      </View>
                      <View style={{borderLeftWidth: 1, borderColor: '#DDDDDD', width: '30%'}}>
                        <View style={{borderBottomWidth: 1, borderColor: '#DDDDDD'}}>
                          <View style={{margin: 5, alignItems: 'center', justifyContent: 'center'}}>
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
                        </View>
                        <View>
                          <View style={{margin: 5, alignItems: 'center', justifyContent: 'center'}}>
                            <Text
                              style={{
                                fontSize: 13,
                                color: '#FFC700',
                              }}>
                              {'Pending'}
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                color: '#FFC700',
                                fontWeight: 'bold',
                              }}>
                              {'₹ ' + pendingAmount}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <View style={{height: 50}}></View>
              </ScrollView>
            </View>
          </View>
        : <View>
            <View
              style={{
                height: screenHeight * 0.15,
                width: screenWidth * 0.95,
                flexDirection: 'row',
                borderWidth: 1,
                borderRadius: 10,
                alignSelf: 'center',
                marginTop: 20,
                backgroundColor: 'white',
                borderColor: '#DDDDDD',
              }}>
              <View
                style={{
                  width: '70%',
                  borderRightWidth: 1,
                  borderColor: '#DDDDDD',
                }}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    height: '50%',
                    padding: 10,
                    borderColor: '#DDDDDD',
                  }}>
                  <Text style={{fontSize: 13, color: '#211951'}}>{'Total'}</Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: '#211951',
                      fontWeight: 'bold',
                    }}>
                    {'₹ ' + totalSupplierAmount}
                  </Text>
                </View>
                <View style={{height: '50%', flexDirection: 'row'}}>
                  <View
                    style={{
                      width: '50%',
                      borderRightWidth: 1,
                      padding: 10,
                      borderColor: '#DDDDDD',
                    }}>
                    <Text style={{fontSize: 13, color: '#17b02a'}}>{'Received'}</Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: '#17b02a',
                        fontWeight: 'bold',
                      }}>
                      {'₹ ' + (totalSupplierAmount - pendingSupplierAmount)}
                    </Text>
                  </View>
                  <View style={{width: '50%', padding: 10}}>
                    <Text style={{fontSize: 13, color: '#FFC700'}}>{'Pending'}</Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: '#FFC700',
                        fontWeight: 'bold',
                      }}>
                      {'₹ ' + pendingSupplierAmount}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  width: '30%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                }}>
                <Text style={{fontSize: 16, color: '#211951', fontWeight: 'bold'}}>
                  {' View\nReport'}
                </Text>
                <Text style={{fontSize: 22, color: '#211951', fontWeight: 'bold'}}>
                  {'>'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View 
              style={{
                flexDirection: 'row',
                marginTop: 30,
                width: screenWidth * 0.95,
                alignSelf: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  width: '68%',
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
                  placeholder="Search Supplier" 
                  style={{fontSize: 16, paddingLeft: 10}}
                  value={searchSupplierValue}
                  onChangeText={text => setSearchSupplierValue(text)}
                  keyboardType={searchFilterChoice ? 'number-pad' : 'default'}
                />
              </View>
              <View 
                style={{
                  backgroundColor: 'white',
                  width: '30%',
                  borderWidth: 1,
                  borderColor: '#DDDDDD',
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Dropdown
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 10,
                  }}
                  selectedTextStyle={{
                    color: '#9900F0',
                    fontSize: 14,
                    fontWeight: '500',
                  }}
                  itemTextStyle={{
                    color: '#232b3d',
                    fontSize: 14,
                  }}
                  activeColor={'#f5f5f5'}
                  data={searchFilterData}
                  value={searchFilterChoice}
                  labelField="label"
                  valueField="value"
                  onChange={value => {setSearchFilterChoice(value.value)}}
                />
              </View>
            </View>

            <View style={{marginTop: 20, paddingHorizontal: 15}}>
              <ScrollView
                style={{
                  height: screenHeight * 0.56
                }}
                showsVerticalScrollIndicator={false}
              >
                {allSupplierData.map(({name, phoneNo, totalAmount, pendingAmount}, index) => {
                  if(searchFilterChoice) {
                    if(!phoneNo.toLowerCase().includes(searchSupplierValue.toLowerCase())) return;
                  }
                  else {
                    if(!name.toLowerCase().includes(searchSupplierValue.toLowerCase())) return;
                  }

                  return (
                    <TouchableOpacity
                      style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                        borderRadius: 10,
                        alignItems: 'center',
                        elevation: 2,
                        backgroundColor: 'white',
                      }}
                      key={index}
                    >
                      <View style={{width: '70%'}}>
                        <View style={{marginLeft: 15}}>
                          <Text
                            style={{
                              fontSize: 18,
                              color: '#211951',
                              fontWeight: '500',
                            }}>
                            {name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              color: '#868686',
                              letterSpacing: 1,
                            }}>
                            {'Phone No: ' + phoneNo}
                          </Text>
                        </View>
                      </View>
                      <View style={{borderLeftWidth: 1, borderColor: '#DDDDDD', width: '30%'}}>
                        <View style={{borderBottomWidth: 1, borderColor: '#DDDDDD'}}>
                          <View style={{margin: 5, alignItems: 'center', justifyContent: 'center'}}>
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
                        </View>
                        <View>
                          <View style={{margin: 5, alignItems: 'center', justifyContent: 'center'}}>
                            <Text
                              style={{
                                fontSize: 13,
                                color: '#FFC700',
                              }}>
                              {'Pending'}
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                color: '#FFC700',
                                fontWeight: 'bold',
                              }}>
                              {'₹ ' + pendingAmount}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <View style={{height: 50}}></View>
              </ScrollView>
            </View>
          </View>
      }

      <TouchableOpacity 
        style={{
          position: 'absolute',
          height: screenHeight*0.05,
          width: screenWidth*0.40,
          bottom: 10,
          right: 10,
          backgroundColor: '#9900F0',
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onPress={()=>{
          if(selectedScreen == 'Customer') {
            navigation.navigate('AddCustomer', {getCustomersData: getCustomersData, userId: userId})
          }
          else {
            navigation.navigate('AddSupplier', {getSuppliersData: getSuppliersData, userId: userId})
          }
        }}
      >
        <Text style={{fontSize: 17, color: 'white', fontWeight: '500'}}>{selectedScreen == "Customer" ? '+  Add Customer' : '+  Add Supplier'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Parties;

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
