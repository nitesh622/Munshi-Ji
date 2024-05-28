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

const BillDetails = () => {
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    const navigation = useNavigation();
    const route = useRoute();
    const {userId, billId} = route.params;
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageType, setAlertMessageType] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
    const [billDetails, setBillDetails] = useState(null);
    const handleAlertMessage = async (message, type) => {
      setShowAlert(true);
      setAlertMessage(message)
      setAlertMessageType(type);
      setTimeout(()=>{setShowAlert(false)}, 2000)
    }

    const handleUpdateBill = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://khata-hl62.onrender.com/api/v1/customerBill/markPaid/${billId}`, {
                method: 'patch',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            
            const data = await res.json();
            setLoading(false);
            if(data.status == "success") {
                handleAlertMessage('Bill Updated Successfully!', true)
                setTimeout(()=>{navigation.goBack()}, 1000)
            }
            else {
                handleAlertMessage('Please verify bill details!', false)
            }
        }
        catch(err) {
            console.log(err);
            setLoading(false);
            handleAlertMessage('Some error occured while saving the bill!', false)
        }
    }

    const getCustomersData = async (customerId) => {

        try {
            const res = await fetch(`https://khata-hl62.onrender.com/api/v1/customer/get/${customerId}`)
            const data = await res.json();
    
            if(data.message == "success") {
                const tempData = data.data;
                const customerDetails = {
                    customerName: tempData.name,
                    customerPhoneNo: tempData.contact
                }

                return customerDetails
            }
            else {
                return null
            }
        }
        catch(err) {
            return null
        }
    }

    const getFormatedDate = (date) => {
        var dd = date.getDate();
        var mm = date.getMonth();
        var yyyy = date.getYear();
        if(dd<10) {dd='0'+dd}
        const newFormat = dd+' '+monthNames[mm]+' '+(yyyy%100);
        return newFormat;
    }

    const getBillDetails = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://khata-hl62.onrender.com/api/v1/customerBill/get/${billId}`)
            const data = await res.json();
    
            if(data.message == "success") {
                const tempData = data.data;
                const customerDetails = await getCustomersData(tempData.customer);
                if(customerDetails != null) {
                    const tempItemsData = tempData.items;
                    const tempItemsArr = [];
                    await Promise.all(tempItemsData.map(({item, quantity, price}) => {
                        tempItemsArr.push({
                            name: item.name,
                            price: price,
                            quantity: quantity
                        })
                    }));
                    
                    setLoading(false);
                    setBillDetails({
                        date: getFormatedDate(new Date(tempData.transactionDate)),
                        totalAmount: tempData.amount,
                        pendingAmount: tempData.unpaid,
                        items: tempItemsArr,
                        customerName: customerDetails.customerName,
                        customerPhoneNo: customerDetails.customerName
                    })
                }
                else {
                    setLoading(false);
                    handleAlertMessage('User Details Not Found!', false)
                }
            }
            else {
                setLoading(false);
                handleAlertMessage('No Data Found!', false)
            }
        }
        catch(err) {
            console.log(err);
            setLoading(false);
            handleAlertMessage('Some error occured!', false)
        }
    }

    useEffect(() => {
        getBillDetails();
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
                    <Text style={{fontSize: 17, fontWeight: '500', color: 'black'}}>{'Bill Dated:  '}</Text>
                    <Text style={{fontSize: 16, color: 'black'}}>{billDetails?.date}</Text>
                </View>

                <View 
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 20,
                    }}
                >
                    <Text style={{fontSize: 17, fontWeight: '500', color: 'black'}}>{'Bill Id:  '}</Text>
                    <Text style={{fontSize: 16, color: 'black'}}>{billId}</Text>
                </View>
                
                <View style={{marginBottom: 20}}>
                    <Text style={{fontSize: 17, fontWeight: '500', color: 'black', marginBottom: 5}}>{'Bill To:'}</Text>
                    <View 
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <View
                            style={{
                                width: screenWidth*0.9,
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
                                    {billDetails?.customerName}
                                    </Text>
                                    <Text
                                    style={{
                                        fontSize: 14,
                                        color: '#868686',
                                        letterSpacing: 1,
                                    }}>
                                    {'Phone No: ' + billDetails?.customerPhoneNo}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View>
                    <Text style={{fontSize: 17, fontWeight: '500', color: 'black', marginBottom: 5}}>{'Items:'}</Text>
                    {
                        billDetails?.items?.length > 0
                        ? <View style={{marginBottom: 10}}>
                            <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                                <View style={{flexDirection: 'row', borderWidth: 1, justifyContent: 'space-between', width: '100%', borderColor: '#DDDDDD', borderTopLeftRadius: 5, borderTopRightRadius: 5}}>
                                    <Text style={{borderRightWidth: 1, fontSize: 15, width: '10%', textAlign: 'center', borderColor: '#DDDDDD', fontWeight: 'bold', color: 'black'}}>{'S. No.'}</Text>
                                    <Text style={{borderRightWidth: 1, fontSize: 15, width: '35%', textAlign: 'center', borderColor: '#DDDDDD', fontWeight: 'bold', color: 'black'}}>{'Name'}</Text>
                                    <Text style={{borderRightWidth: 1, fontSize: 15, width: '30%', textAlign: 'center', borderColor: '#DDDDDD', fontWeight: 'bold', color: 'black'}}>{'Quantity x Price'}</Text>
                                    <Text style={{fontSize: 15, width: '18%', textAlign: 'center', fontWeight: 'bold', color: 'black'}}>{'Total'}</Text>
                                </View>
                                <View style={{width: 20}}/>
                            </View>
                            {
                                billDetails?.items?.map(({name, quantity, price}, index) => {
                                    return (
                                        <View 
                                            style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}
                                            key={index}
                                        >
                                            <View 
                                                style={{flexDirection: 'row', borderWidth: 1, justifyContent: 'space-between', width: '100%', borderTopWidth: 0, borderColor: '#DDDDDD'}}
                                                key={index}
                                            >
                                                <Text style={{borderRightWidth: 1, fontSize: 15, width: '10%', textAlign: 'center', borderColor: '#DDDDDD', paddingVertical: 5}}>{index+1}</Text>
                                                <Text style={{borderRightWidth: 1, fontSize: 15, width: '35%', textAlign: 'center', borderColor: '#DDDDDD', paddingVertical: 5}}>{name}</Text>
                                                <Text style={{borderRightWidth: 1, fontSize: 15, width: '30%', textAlign: 'center', borderColor: '#DDDDDD', paddingVertical: 5}}>{quantity + ' x ' + price}</Text>
                                                <Text style={{fontSize: 15, width: '18%', textAlign: 'center', paddingVertical: 5}}>{quantity*price}</Text>
                                            </View>
                                        </View>
                                    );
                                })
                            }
                        </View>
                        : null
                    }
                </View>
                
                <View style={{marginTop: responsiveHeight(3), flexDirection: 'row'}}>
                    <Text style={{fontSize: 17, fontWeight: '500', color: 'black', marginBottom: 5}}>{'Total Amount:'}</Text>
                    <Text style={{fontSize: 18, fontWeight: 'bold', color: 'black', marginBottom: 5, marginLeft: responsiveWidth(2)}}>{'₹ '+billDetails?.totalAmount}</Text>
                </View>

                <View style={{marginTop: responsiveHeight(1), flexDirection: 'row'}}>
                    <Text style={{fontSize: 17, fontWeight: '500', color: 'black', marginBottom: 5}}>{'Pending Amount:'}</Text>
                    <Text style={{fontSize: 18, fontWeight: 'bold', color: 'black', marginBottom: 5, marginLeft: responsiveWidth(2)}}>{'₹ '+billDetails?.pendingAmount}</Text>
                </View>
                {
                    billDetails?.pendingAmount > 0
                    ? <View style={{marginTop: responsiveHeight(1)}}>
                        <Text style={{fontSize: 17, fontWeight: '500', color: 'black', marginBottom: 5}}>{'Mark it as:'}</Text>
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
                    : null
                }
            </View>
            
            {
                isPaid
                ? <View style={{paddingVertical: 15}}>
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
                        onPress={()=>{handleUpdateBill()}}
                    >
                        <Text style={{fontSize: 17, color: 'white', fontWeight: 'bold', letterSpacing: 1}}>{'Update Bill'}</Text>
                    </TouchableOpacity>
                </View>
                : null
            }

            <Modal
                visible={(isPaidModalOpen)?true:false}
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
        </View>
    )
}

export default BillDetails

const styles = StyleSheet.create({})