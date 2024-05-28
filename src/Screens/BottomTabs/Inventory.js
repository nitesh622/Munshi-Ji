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
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import {BarChart} from "react-native-chart-kit";
import BarGraph from '../../Components/BarGraph';

const Inventory = () => {
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const [inputProductName, setInputProductName] = useState('');
  const [allProductsData, setAllProductsData] = useState([]);
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertMessageType, setAlertMessageType] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mostSellingItemsData, setMostSellingItemsData] = useState({names: [], sales: [], namesMap: []});

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

  const getProductsData = async () => {
    let uId = userId;
    if(uId == null) {
      uId = await getUserId();
    }
    setLoading(true);
    try {
      const res = await fetch(`https://khata-hl62.onrender.com/api/v1/product/findProducts?user=${uId}`)
      const data = await res.json();
      
      if(data.status == "success") {
        const dataArr = data.data;
        let tempArr = []
        let tempSalesArr = [];
        await Promise.all(dataArr.map(
          ({id, name, price, quantity, sales}) => {
            tempArr.push({
              name: name,
              price: price,
              quantity: quantity,
              id: id
            });
            tempSalesArr.push({
              name: name,
              sales: sales
            })
          }
        ))

        tempSalesArr.sort((a, b) => b.sales - a.sales);
        let tempNames = []
        let tempSales = []
        let tempNamesMap = []
        let lst = ['A', 'B', 'C', 'D', 'E'];
        for(let i=0; i<Math.min(tempSalesArr.length, 5); i++) {
          tempNames.push(tempSalesArr[i].name);
          tempSales.push(tempSalesArr[i].sales);
          tempNamesMap.push(lst[i]);
        }

        setLoading(false);
        setMostSellingItemsData({
          names: tempNames,
          sales: tempSales,
          namesMap: tempNamesMap
        })
        setAllProductsData(tempArr)
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
    getProductsData();
  }, [])

  const data = {
    labels: mostSellingItemsData?.namesMap,
    datasets: [
      {
        data: mostSellingItemsData?.sales
      }
    ]
  };

  const handleRefreshing = async () => {
    setRefreshing(true);
    getProductsData();
    setRefreshing(false);
  }

  return (
    <View style={{flex: 1, backgroundColor: '#F5F5F5', marginTop: responsiveHeight(4)}}>
      <Loader isOpen={loading}/>
      <PopUpMessage isOpen={showAlert} message={alertMessage} success={alertMessageType}/>
      <ScrollView 
        contentContainerStyle={{flexGrow: 1}} 
        showsVerticalScrollIndicator={false} 
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={() => {handleRefreshing()}}
          />
        }
      >
          <View style={{
            paddingHorizontal: 15,
          }}>
            <Text 
              style={{
                fontSize: 22,
                paddingVertical: 10,
                fontWeight: 'bold',
                color: '#211951',
                letterSpacing: 1,
              }}
            >
              {"Top Selling Products"}
            </Text>
            <View style={{alignItems: 'center'}}>
              <BarChart
                data={data}
                width={responsiveWidth(93)}
                height={responsiveHeight(27)}
                fromZero={true}
                chartConfig={{
                  backgroundColor: "#F1EAFF",
                  backgroundGradientFrom: "#F1EAFF",
                  backgroundGradientTo: "#F1EAFF",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                // showValuesOnTopOfBars={true}
                style={{
                  borderRadius: 7,
                  elevation: 2,
                }}
              />
            </View>

            <View
              style={{
                width: responsiveWidth(93), 
                padding: responsiveHeight(1), 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                justifyContent: 'space-between', 
                backgroundColor: 'white',
                borderRadius: 10,
                elevation: 2,
                marginTop: responsiveHeight(1)
              }}
            >
              {
                mostSellingItemsData.names.map((val, index)=>{
                  return (
                    <View 
                      style={{
                        width: '45%', 
                        flexDirection: 'row', 
                        borderRadius: 7, 
                        paddingHorizontal: responsiveHeight(0.5), 
                        // paddingVertical: responsiveHeight(0.3),
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: responsiveHeight(0.5)
                      }}
                      key={index}
                    >
                      <View
                        style={{width: '20%', textAlign: 'center', alignItems: 'center', justifyContent: 'center', borderColor: '#DDDDDD'}}
                      >
                        <Text
                          style={{fontSize: 16, fontWeight: 'bold', color: 'black'}}
                        >
                          {mostSellingItemsData.namesMap[index]}
                        </Text>
                      </View>
                      <Text 
                        style={{
                          width: '70%',
                          fontSize: 15,
                          fontWeight: '400',
                          color: 'black',
                          marginLeft: responsiveWidth(1)
                        }}
                      >
                        {val}
                      </Text>
                    </View>
                  )
                })
              }
            </View>
          </View>


        <View style={{paddingHorizontal: 10, marginTop: responsiveHeight(3)}}>
          <Text
            style={{
              fontSize: 22,
              marginBottom: responsiveHeight(0.5),
              fontWeight: 'bold',
              color: '#211951',
            }}>
            {'Search a Product'}
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
              placeholder="Enter Product Name"
              style={{fontSize: 16, paddingLeft: 10}}
              value={inputProductName}
              onChangeText={text => setInputProductName(text)}
            />
          </View>
        </View>

        <View style={{marginTop: 20, paddingHorizontal: 15}}>
          {allProductsData.map(({name, price, quantity}, index) => {
            if(!name.toLowerCase().includes(inputProductName.toLowerCase())) return;
            return (
              <TouchableOpacity
                style={{
                  height: screenHeight * 0.1,
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  elevation: 2,
                  backgroundColor: 'white',
                }}
                key={index}>
                <View style={{paddingLeft: 15}}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: '#211951',
                      fontWeight: '500',
                      marginBottom: 5,
                    }}>
                    {name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#868686',
                    }}>
                    {'Price: ₹ ' + price}
                  </Text>
                </View>
                <View style={{alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, width: '25%', height: '100%', borderColor: '#DDDDDD',}}>
                {
                  quantity == 0
                  ? <Text
                      style={{
                        fontSize: 16,
                        color: 'red',
                        fontWeight: 'bold',
                      }}>
                      {'Out of\nStock'}
                    </Text>
                  : <>
                      <Text
                        style={{
                          fontSize: 13,
                          color: '#211951',
                          fontWeight: '500'
                        }}>
                        {'Quantity'}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: '#211951',
                          fontWeight: 'bold',
                        }}>
                        {quantity}
                      </Text>
                    </>
                }
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{height: responsiveHeight(7)}}/>
        </View>

      </ScrollView>
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
          navigation.navigate('AddNewProduct', {getProductsData: getProductsData, userId: userId});
        }}
      >
        <Text
          style={{
            fontSize: 17,
            color: 'white',
            fontWeight: 'bold',
            letterSpacing: 1,
          }}>
          {'+  Add Product'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Inventory;

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
