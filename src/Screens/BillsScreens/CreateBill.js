import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Image, Modal, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TextInput } from 'react-native-gesture-handler';
import { Dropdown } from 'react-native-element-dropdown';
import Loader from '../../Components/Loader';
import PopUpMessage from '../../Components/PopUpMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

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

const CreateBill = () => {
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    const [todayDate, setTodayDate] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [openEditProduct, setOpenEditProduct] = useState(false);
    const [openSearchCustomer, setOpenSearchCustomer] = useState(false);
    const [openSearchProduct, setOpenSearchProduct] = useState(false);
    const [editProductDetails, setEditProductDetails] = useState(null);
    const [totalBillPrice, setTotalBillPrice] = useState(0);
    const [searchFilterChoice, setSearchFilterChoice] = useState(false);
    const [searchCustomerValue, setSearchCustomerValue] = useState('');
    const [searchProductValue, setSearchProductValue] = useState('');
    const [allCustomersData, setAllCustomersData] = useState([]);
    const [allProductsData, setAllProductsData] = useState([]);
    const navigation = useNavigation();
    const route = useRoute();
    const {getBillsData, userId} = route.params;
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageType, setAlertMessageType] = useState(false);
    const [isPaid, setIsPaid] = useState(true);
  
    const handleAlertMessage = async (message, type) => {
        setShowAlert(true);
        setAlertMessage(message)
        setAlertMessageType(type);
        setTimeout(()=>{setShowAlert(false)}, 2000)
    }

    const handleAddBill = async () => {
        if(customerDetails == null) {
            handleAlertMessage('Please add a customer!', false);
            return;
        }
        
        if(selectedItems.length == 0) {
            handleAlertMessage('Please add some items!', false);
            return;
        }
        
        setLoading(true);
        let tempItemsArr = [];
        selectedItems.map(({id, price, quantity}) => {
            tempItemsArr.push({
                item: id,
                quantity: quantity,
                price: price
            });
        })

        const newBillData = {
            amount: totalBillPrice,
            items: tempItemsArr,
            customer: customerDetails.customerId,
            user: userId,
            unpaid: isPaid ? 0 : totalBillPrice
        }

        try {
            const res = await fetch('https://khata-hl62.onrender.com/api/v1/customerBill/add', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBillData)
            });
            
            const data = await res.json();
            
            if(data.status == "success") {
                await getBillsData();
                setLoading(false);
                handleAlertMessage('Bill Added Successfully!', true)
                setTimeout(()=>{navigation.goBack()}, 1000)
            }
            else {
                setLoading(false);
                handleAlertMessage('Please check bills details carefully!', false)
            }
        }
        catch(err) {
            console.log(err);
            setLoading(false);
            handleAlertMessage('Some error occured while saving the bill!', false)
        }
    }

    const getTotalBillPrice = async () => {
        let tempTotal = 0
        selectedItems.map(({price, quantity}) => {
            tempTotal += (price*quantity)
        })
        setTotalBillPrice(tempTotal);
    }

    useEffect(() => {
        getTotalBillPrice();
    }, [selectedItems])

    const getCustomersData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://khata-hl62.onrender.com/api/v1/customer/getforUser/${userId}`)
            const data = await res.json();
            
            if(data.status == "success") {
                const dataArr = data.data;
                let tempArr = []
                await Promise.all(dataArr.map(
                ({_id, contact, name}) => {
                    tempArr.push({
                        customerId: _id,
                        name: name,
                        phoneNo: contact,
                    })
                }
                ))
        
                setLoading(false);
                setAllCustomersData(tempArr)
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

    const getProductsData = async () => {
        setLoading(true);
        try {
          const res = await fetch(`https://khata-hl62.onrender.com/api/v1/product/findProducts?user=${userId}`)
          const data = await res.json();
          
          if(data.status == "success") {
            const dataArr = data.data;
            let tempArr = []
            await Promise.all(dataArr.map(
              ({id, name, price, quantity}) => {
                tempArr.push({
                    name: name,
                    price: price,
                    quantity: quantity,
                    id: id,
                })
              }
            ))
    
            setLoading(false);
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

    const searchFilterData = [
        {label: 'Name', value: false},
        {label: 'Phone No.', value: true},
    ]

    const getTodayDate = () => {
        const date = new Date();
        var dd = date.getDate();
        var mm = date.getMonth();
        var yyyy = date.getYear();
        if(dd<10) {dd='0'+dd}
        const newFormat = dd+' '+monthNames[mm]+' '+(yyyy%100);
        setTodayDate(newFormat);
    }

    useEffect(() => {
        getTodayDate();
        getCustomersData();
        getProductsData();
    }, [])

    return (
        <View style={{flex: 1, backgroundColor: '#F5F5F5', marginTop: 20, justifyContent: 'space-between'}}>
            <Loader isOpen={loading}/>
            <PopUpMessage isOpen={showAlert} message={alertMessage} success={alertMessageType}/>
            <View 
                style={{
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: 'white',
                    width: screenWidth*0.95,
                    alignSelf: 'center'
                }}
            >
                <View 
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 20,
                    }}
                >
                    <Text style={{fontSize: 17, fontWeight: '500', color: 'black'}}>{'Date:  '}</Text>
                    <Text style={{fontSize: 16, color: 'black'}}>{todayDate}</Text>
                </View>
                
                <View style={{marginBottom: 20}}>
                    <Text style={{fontSize: 17, fontWeight: '500', color: 'black', marginBottom: 5}}>{'Bill To:'}</Text>
                    {
                        customerDetails == null
                        ? <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <TouchableOpacity
                                style={{
                                    width: '55%',
                                    flexDirection: 'row',
                                    backgroundColor: '#F1EAFF',
                                    alignItems: 'center',
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 7,
                                }}
                                onPress={()=>{setOpenSearchCustomer(true)}}
                            >
                                <Icon name="search" size={22} color="#9900F0" />
                                <Text 
                                    style={{fontSize: 15, paddingLeft: 7}}
                                >
                                    {'Search from parties'}
                                </Text>
                            </TouchableOpacity>
                            <View style={{borderRightWidth: 1, height: '90%', borderColor: '#DDDDDD', borderStyle: 'dashed'}}/>
                            <TouchableOpacity 
                                style={{
                                    paddingVertical: 5,
                                    width: '40%',
                                    backgroundColor: '#9900F0',
                                    borderRadius: 7,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onPress={()=>{navigation.navigate('AddCustomer', {getCustomersData: getCustomersData, userId: userId})}}
                            >
                                <Text style={{fontSize: 15, color: 'white', fontWeight: '500'}}>{'+ Add Customer'}</Text>
                            </TouchableOpacity>
                        </View>
                        : <View 
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <View
                                style={{
                                    width: screenWidth*0.8,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 10,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    elevation: 2,
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                }}
                            >
                                <View style={{width: '100%'}}>
                                    <View style={{marginLeft: 15}}>
                                        <Text
                                        style={{
                                            fontSize: 18,
                                            color: '#211951',
                                            fontWeight: '500',
                                        }}>
                                        {customerDetails?.name}
                                        </Text>
                                        <Text
                                        style={{
                                            fontSize: 14,
                                            color: '#868686',
                                            letterSpacing: 1,
                                        }}>
                                        {'Phone No: ' + customerDetails?.phoneNo}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity onPress={()=>{setCustomerDetails(null)}}>
                                <Entypo name='circle-with-cross' size={25} color={'#9900F0'}/>
                            </TouchableOpacity>
                        </View>
                    }
                </View>

                <View>
                    <Text style={{fontSize: 17, fontWeight: '500', color: 'black', marginBottom: 5}}>{'Items:'}</Text>
                    {
                        selectedItems.length > 0
                        ? <View style={{marginBottom: 10}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <View style={{flexDirection: 'row', borderWidth: 1, justifyContent: 'space-between', borderColor: '#DDDDDD', borderTopLeftRadius: 5, borderTopRightRadius: 5}}>
                                    <Text style={{borderRightWidth: 1, fontSize: 15, width: '10%', textAlign: 'center', borderColor: '#DDDDDD', fontWeight: 'bold', color: 'black'}}>{'S. No.'}</Text>
                                    <Text style={{borderRightWidth: 1, fontSize: 15, width: '35%', textAlign: 'center', borderColor: '#DDDDDD', fontWeight: 'bold', color: 'black'}}>{'Name'}</Text>
                                    <Text style={{borderRightWidth: 1, fontSize: 15, width: '30%', textAlign: 'center', borderColor: '#DDDDDD', fontWeight: 'bold', color: 'black'}}>{'Quantity x Price'}</Text>
                                    <Text style={{fontSize: 15, width: '18%', textAlign: 'center', fontWeight: 'bold', color: 'black'}}>{'Total'}</Text>
                                </View>
                                <View style={{width: 20}}/>
                            </View>
                            {
                                selectedItems.map(({name, quantity, price}, index) => {
                                    return (
                                        <View 
                                            style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}
                                            key={index}
                                        >
                                            <View 
                                                style={{flexDirection: 'row', borderWidth: 1, justifyContent: 'space-between', borderTopWidth: 0, borderColor: '#DDDDDD'}}
                                                key={index}
                                            >
                                                <Text style={{borderRightWidth: 1, fontSize: 15, width: '10%', textAlign: 'center', borderColor: '#DDDDDD', paddingVertical: 5}}>{index+1}</Text>
                                                <Text style={{borderRightWidth: 1, fontSize: 15, width: '35%', textAlign: 'center', borderColor: '#DDDDDD', paddingVertical: 5}}>{name}</Text>
                                                <Text style={{borderRightWidth: 1, fontSize: 15, width: '30%', textAlign: 'center', borderColor: '#DDDDDD', paddingVertical: 5}}>{quantity + ' x ' + price}</Text>
                                                <Text style={{fontSize: 15, width: '18%', textAlign: 'center', paddingVertical: 5}}>{quantity*price}</Text>
                                            </View>
                                            <TouchableOpacity 
                                                onPress={()=>{
                                                    setOpenEditProduct(true)
                                                    setEditProductDetails({productId: index, quantity: quantity})
                                                }}
                                            >
                                                <Feather name='edit' size={20} color={'#9900F0'}/>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })
                            }
                        </View>
                        : null
                    }
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <TouchableOpacity
                            style={{
                                width: '55%',
                                flexDirection: 'row',
                                backgroundColor: '#F1EAFF',
                                alignItems: 'center',
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderRadius: 7,
                            }}
                            onPress={() => {setOpenSearchProduct(true)}}
                        >
                            <Image 
                                source={require('../../assets/inventory-outline.png')} 
                                style={{height: 25, width: 25}}
                            />
                            <Text 
                                style={{fontSize: 15, paddingLeft: 10}}
                            >
                                {'Select from inventory'}
                            </Text>
                        </TouchableOpacity>
                        <View style={{borderRightWidth: 1, height: '90%', borderColor: '#DDDDDD', borderStyle: 'dashed'}}/>
                        <TouchableOpacity 
                            style={{
                                paddingVertical: 5,
                                width: '40%',
                                backgroundColor: '#9900F0',
                                borderRadius: 7,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={()=>{navigation.navigate('AddNewProduct', {getProductsData: getProductsData, userId: userId});}}
                        >
                            <Text style={{fontSize: 15, color: 'white', fontWeight: '500'}}>{'+ Add New Item'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={{marginTop: responsiveHeight(3)}}>
                    <Text style={{fontSize: 17, fontWeight: '500', color: 'black', marginBottom: 5}}>{'Bill Type:'}</Text>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: responsiveWidth(2)}}>
                        <TouchableOpacity
                            onPress={() => {setIsPaid(true)}}
                            style={{flexDirection: 'row'}}
                        >
                            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                                <View style={{height: 22, width: 22, borderRadius: 30, backgroundColor: isPaid ? '#9900F0' : '#d4d4d4'}} />
                                <View style={{height: 10, width: 10, borderRadius: 30, backgroundColor: 'white', position:'absolute'}} />
                            </View>
                            <Text style={{fontSize: 18, color: 'black', fontWeight: 'bold', marginLeft: responsiveWidth(2)}}>{'Paid'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {setIsPaid(false)}}
                            style={{flexDirection: 'row'}}
                        >
                            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                                <View style={{height: 22, width: 22, borderRadius: 30, backgroundColor: !isPaid ? '#9900F0' : '#d4d4d4'}} />
                                <View style={{height: 10, width: 10, borderRadius: 30, backgroundColor: 'white', position:'absolute'}} />
                            </View>
                            <Text style={{fontSize: 18, color: 'black', fontWeight: 'bold', marginLeft: responsiveWidth(2)}}>{'Unpaid'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={{backgroundColor: '#eee5ff', paddingVertical: 15}}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginHorizontal: 10}}>
                    <Text style={{fontSize: 22, fontWeight: 'bold', color: '#211951', width: screenWidth*0.3}}>
                        {"Total Price:"}
                    </Text>
                    <Text style={{fontSize: 22, color: '#211951', marginLeft: 5, fontWeight: 'bold'}}>{'₹ '+totalBillPrice}</Text>
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
                    }}
                    onPress={()=>{handleAddBill()}}
                >
                    <Text style={{fontSize: 17, color: 'white', fontWeight: 'bold', letterSpacing: 1}}>{'Save Bill'}</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={(openEditProduct | openSearchCustomer | openSearchProduct)?true:false}
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
                        opacity: 0.4,
                    }}
                />
            </Modal>

            <Modal 
                visible={openEditProduct} 
                transparent={true}
                animationType='slide'
            >
                <View
                    style={{
                        position: 'absolute',
                        padding: 20,
                        width: screenWidth,
                        alignSelf: 'center',
                        bottom: 0,
                        borderRadius: 10,
                        backgroundColor: 'white',
                        elevation: 5,
                    }}
                >
                    <TouchableOpacity 
                        style={{position: 'absolute', top: 10, right: 10}}
                        onPress={() => {
                            setOpenEditProduct(false)
                            setEditProductDetails(null)
                        }}
                    >
                        <Entypo name='cross' size={25} color={'black'}/>
                    </TouchableOpacity>
                    <View>
                        <View>
                            <View style={{flexDirection: 'row', marginVertical: 10, alignItems: 'center'}}>
                                <Text style={{fontSize: 18, fontWeight: 'bold', color: '#211951', width: screenWidth*0.35}}>
                                    {"Product Name:"}
                                </Text>
                                <View style={{borderWidth: 1, width: screenWidth*0.4, padding: 5, borderRadius: 5, backgroundColor: '#F1EAFF', borderColor: '#e0d1ff'}}>
                                    <Text style={{fontSize: 15, color: '#211951', marginLeft: 5}}>{selectedItems[editProductDetails?.productId]?.name}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', marginVertical: 10, alignItems: 'center'}}>
                                <Text style={{fontSize: 18, fontWeight: 'bold', color: '#211951', width: screenWidth*0.35}}>
                                    {"Price:"}
                                </Text>
                                <View style={{borderWidth: 1, width: screenWidth*0.4, padding: 5, borderRadius: 5, backgroundColor: '#F1EAFF', borderColor: '#e0d1ff'}}>
                                    <Text style={{fontSize: 15, color: '#211951', marginLeft: 5}}>{'₹ '+selectedItems[editProductDetails?.productId]?.price}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', marginVertical: 10, alignItems: 'center'}}>
                                <Text style={{fontSize: 18, fontWeight: 'bold', color: '#211951', width: screenWidth*0.35}}>
                                    {"Quantity:"}
                                </Text>
                                <View style={{flexDirection: 'row', borderWidth: 1, width: screenWidth*0.4, borderRadius: 5, backgroundColor: '#9900F0', borderColor: '#e0d1ff'}}>
                                    <TouchableOpacity 
                                        style={{width: '25%', alignItems: 'center', justifyContent: 'center'}}
                                        onPress={() => {
                                            if(editProductDetails?.quantity > 0) {
                                                setEditProductDetails({...editProductDetails, quantity: editProductDetails?.quantity - 1})
                                            }
                                        }}
                                    >
                                        <Entypo name='minus' size={22} color='white'/>
                                    </TouchableOpacity>
                                    <TextInput
                                        value={`${editProductDetails?.quantity}`}
                                        style={{paddingVertical: 0, width: '50%', textAlign: 'center', backgroundColor: '#F1EAFF'}}
                                        onChangeText={(text) => {
                                            const newVal = parseFloat(text);
                                            if(text == '' || newVal <= 0) {
                                                setEditProductDetails({...editProductDetails, quantity: 0})
                                            }
                                            else {
                                                if(newVal > selectedItems[editProductDetails?.productId]?.totalQuantity) {
                                                    setEditProductDetails({...editProductDetails, quantity: selectedItems[editProductDetails?.productId]?.totalQuantity})
                                                }
                                                else {
                                                    setEditProductDetails({...editProductDetails, quantity: newVal})
                                                }
                                            }
                                        }}
                                        keyboardType='phone-pad'
                                    />
                                    <TouchableOpacity 
                                        style={{width: '25%', alignItems: 'center', justifyContent: 'center'}}
                                        onPress={() => {
                                            if(editProductDetails?.quantity < selectedItems[editProductDetails?.productId]?.totalQuantity) {
                                                setEditProductDetails({...editProductDetails, quantity: editProductDetails?.quantity + 1})
                                            }
                                        }}
                                    >
                                        <Entypo name='plus' size={22} color='white'/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', marginVertical: 20, alignItems: 'center'}}>
                                <Text style={{fontSize: 22, fontWeight: 'bold', color: '#211951', width: screenWidth*0.35}}>
                                    {"Total Price:"}
                                </Text>
                                <Text style={{fontSize: 22, color: '#211951', marginLeft: 5, fontWeight: 'bold'}}>{'₹ '+selectedItems[editProductDetails?.productId]?.price*editProductDetails?.quantity}</Text>
                            </View>
                        </View>

                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <TouchableOpacity
                                style={{
                                    padding: 7,
                                    width: '45%',
                                    backgroundColor: '#e4d6ff',
                                    borderRadius: 7,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}

                                onPress={() => {
                                    setEditProductDetails({...editProductDetails, quantity: selectedItems[editProductDetails?.productId].quantity})
                                }}
                            >
                                <Text style={{fontSize: 17, fontWeight: '500', color: 'black'}}>
                                    {"Discard Changes"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{
                                    padding: 7,
                                    width: '45%',
                                    backgroundColor: '#9900F0',
                                    borderRadius: 7,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onPress={()=>{
                                    let tempArr = selectedItems;
                                    tempArr[editProductDetails?.productId] = {...tempArr[editProductDetails?.productId], quantity: editProductDetails?.quantity};
                                    setSelectedItems(tempArr)
                                    setOpenEditProduct(false)
                                    setEditProductDetails(null)
                                    getTotalBillPrice();
                                }}
                            >
                                <Text style={{fontSize: 17, color: 'white', fontWeight: '500'}}>{'Save Changes'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10}}>
                            <View style={{width: '45%', borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#cfcfcf'}}/>
                            <Text style={{fontSize: 12, color: '#cfcfcf'}}>{'OR'}</Text>
                            <View style={{width: '45%', borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#cfcfcf'}}/>
                        </View>

                        <TouchableOpacity 
                            style={{
                                padding: 7,
                                width: '50%',
                                backgroundColor: '#d90d0d',
                                borderRadius: 7,
                                alignItems: 'center',
                                justifyContent: 'center',
                                alignSelf: 'center'
                            }}
                            onPress={()=>{
                                let tempArr = [];
                                let cnt=0;
                                selectedItems.map((item) => {
                                    if(item?.productId != editProductDetails?.productId) {
                                        tempArr.push({...item, productId: cnt});
                                        cnt++;
                                    }
                                })
                                setSelectedItems(tempArr);
                                setOpenEditProduct(false)
                                setEditProductDetails(null)
                            }}
                        >
                            <Text style={{fontSize: 17, color: 'white', fontWeight: '500'}}>{'Remove Product'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal 
                visible={openSearchCustomer} 
                transparent={true}
                animationType='slide'
            >
                <View
                    style={{
                        position: 'absolute',
                        padding: 10,
                        width: screenWidth,
                        alignSelf: 'center',
                        bottom: 0,
                        borderRadius: 10,
                        backgroundColor: '#F5F5F5',
                        elevation: 5,
                    }}
                >
                    <TouchableOpacity 
                        style={{position: 'absolute', top: 10, right: 10}}
                        onPress={() => {
                            setSearchCustomerValue('');
                            setOpenSearchCustomer(false);
                            setSearchFilterChoice(false);
                        }}
                    >
                        <Entypo name='cross' size={25} color={'black'}/>
                    </TouchableOpacity>
                    
                    <View>
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
                                }}
                            >
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
                    </View>

                    <View style={{marginTop: 20}}>
                        <ScrollView
                            style={{height: screenHeight * 0.5}}
                            showsVerticalScrollIndicator={false}
                        >
                        {
                            allCustomersData.map(({name, phoneNo, customerId}, index) => {
                                if(searchFilterChoice) {
                                    if(!phoneNo.toLowerCase().includes(searchCustomerValue.toLowerCase())) return;
                                }
                                else {
                                    if(!name.toLowerCase().includes(searchCustomerValue.toLowerCase())) return;
                                }

                                return (
                                    <TouchableOpacity
                                        style={{
                                            width: screenWidth*0.95,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginBottom: 10,
                                            borderRadius: 10,
                                            alignItems: 'center',
                                            elevation: 2,
                                            backgroundColor: 'white',
                                            paddingVertical: 10,
                                        }}
                                        key={index}
                                        onPress={() => {
                                            setCustomerDetails({name: name, phoneNo: phoneNo, customerId: customerId})
                                            setSearchCustomerValue('');
                                            setOpenSearchCustomer(false);
                                            setSearchFilterChoice(false);
                                        }}
                                    >
                                        <View style={{width: '100%'}}>
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
                                    </TouchableOpacity>
                                );
                            }) 
                        }
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal 
                visible={openSearchProduct} 
                transparent={true}
                animationType='slide'
            >
                <View
                    style={{
                        position: 'absolute',
                        padding: 10,
                        width: screenWidth,
                        alignSelf: 'center',
                        bottom: 0,
                        borderRadius: 10,
                        backgroundColor: '#F5F5F5',
                        elevation: 5,
                    }}
                >
                    <TouchableOpacity 
                        style={{position: 'absolute', top: 10, right: 10}}
                        onPress={() => {
                            setSearchProductValue('');
                            setOpenSearchProduct(false);
                        }}
                    >
                        <Entypo name='cross' size={25} color={'black'}/>
                    </TouchableOpacity>
                    
                    <View>
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
                                    width: '100%',
                                    flexDirection: 'row',
                                    backgroundColor: 'white',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    paddingHorizontal: 15,
                                    borderColor: '#DDDDDD',
                                    borderRadius: 10,
                                }}
                            >
                                <Icon name="search" size={26} color="#9900F0" />
                                <TextInput 
                                    placeholder="Search Product" 
                                    style={{fontSize: 16, paddingLeft: 10}}
                                    value={searchProductValue}
                                    onChangeText={text => setSearchProductValue(text)}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={{marginTop: 20}}>
                        <ScrollView
                            style={{height: screenHeight * 0.5}}
                            showsVerticalScrollIndicator={false}
                        >
                        {
                            allProductsData.map(({name, price, quantity, id}, index) => {
                                if(!name.toLowerCase().includes(searchProductValue.toLowerCase()) || quantity==0) return;
                                
                                return (
                                    <TouchableOpacity
                                        style={{
                                            width: screenWidth*0.95,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginBottom: 10,
                                            borderRadius: 10,
                                            alignItems: 'center',
                                            elevation: 2,
                                            backgroundColor: 'white',
                                            paddingVertical: 10,
                                        }}
                                        key={index}
                                        onPress={async () => {
                                            let fl = 0

                                            await Promise.all(selectedItems.map(item => {
                                                if(item.id == id) {
                                                    fl = 1;
                                                }
                                            }))
                                            
                                            if(fl == 1) {
                                                handleAlertMessage('Product already exist', false);
                                                return;
                                            }

                                            setSearchProductValue('');
                                            setOpenSearchProduct(false);
                                            setSelectedItems([...selectedItems, {name: name, quantity: 1, price: price, productId: index, id: id, totalQuantity: quantity}])
                                            setOpenEditProduct(true)
                                            setEditProductDetails({productId: index, quantity: 1})
                                        }}
                                    >
                                        <View style={{width: '100%'}}>
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
                                                {'Price: ' + price}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }) 
                        }
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default CreateBill

const styles = StyleSheet.create({})