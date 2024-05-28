import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Modal,
    ScrollView
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../Components/Loader';
import PopUpMessage from '../../Components/PopUpMessage';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

const newProductSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    price: yup
        .string()
        .required('Price is required')
        .matches(/^\d+$/, 'Price must contain only digits'),
    quantity: yup
        .string()
        .required('Quantity is required')
        .matches(/^\d+$/, 'Quantity must contain only digits'),
});

const AddNewProduct = () => {
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    const navigation = useNavigation();
    const route = useRoute();
    const { getProductsData, userId } = route.params;
    const [allSupplierData, setAllSupplierData] = useState([]);
    const [supplierDetails, setSupplierDetails] = useState(null);
    const [openSearchSupplier, setOpenSearchSupplier] = useState(false);
    const [searchSupplierValue, setSearchSupplierValue] = useState('');
    const [searchFilterChoice, setSearchFilterChoice] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageType, setAlertMessageType] = useState(false);

    const searchFilterData = [
        { label: 'Name', value: false },
        { label: 'Phone No.', value: true },
    ];

    const handleAlertMessage = async (message, type) => {
        setShowAlert(true);
        setAlertMessage(message);
        setAlertMessageType(type);
        setTimeout(() => {
            setShowAlert(false);
        }, 2000);
    };

    const getSuppliersData = async () => {
        setLoading(true);

        try {
            const res = await fetch(
                `https://khata-hl62.onrender.com/api/v1/supplier/findSuppliers/${userId}`,
            );
            const data = await res.json();

            if (data.status == 'success') {
                const dataArr = data.data;
                let tempArr = [];
                await Promise.all(
                    dataArr.map(({ id, contact, name }) => {
                        tempArr.push({
                            supplierId: id,
                            name: name,
                            phoneNo: contact,
                        });
                    }),
                );

                setLoading(false);
                setAllSupplierData(tempArr);
            } else {
                setLoading(false);
                handleAlertMessage('No Data Found!', false);
            }
        } catch (err) {
            console.log(err);
            setLoading(false);
            handleAlertMessage('No Data Found!', false);
        }
    };

    useEffect(() => {
        getSuppliersData();
    }, [])

    const handleAddProduct = async ({ name, price, quantity }) => {
        if(supplierDetails == null) {
            handleAlertMessage('Please select the Supplier!', false)
            return
        }

        setLoading(true);
        const newProductData = {
            name: name,
            price: price,
            quantity: quantity,
            user: userId,
            supplier: supplierDetails.supplierId,
        };

        try {
            const res = await fetch(
                'https://khata-hl62.onrender.com/api/v1/product/add',
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newProductData),
                },
            );

            const data = await res.json();

            if (data.status == 'success') {
                await getProductsData();
                setLoading(false);
                handleAlertMessage('Product Added Successfully!', true);
                setTimeout(() => {
                    navigation.goBack();
                }, 500);
            } else {
                setLoading(false);
                handleAlertMessage('Product already exist!', false);
            }
        } catch (err) {
            console.log(err);
            setLoading(false);
            handleAlertMessage('Some Error Occured!', false);
        }
    };

    const productFormik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: '',
            price: '',
            quantity: '',
        },
        validationSchema: newProductSchema,
        onSubmit: handleAddProduct,
    });

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#F5F5F5',
                marginTop: 20,
                justifyContent: 'space-between',
            }}>
            <Loader isOpen={loading} />
            <PopUpMessage
                isOpen={showAlert}
                message={alertMessage}
                success={alertMessageType}
            />
            <View style={{ paddingHorizontal: 10 }}>
                <View>
                    <Text style={styles.inputBoxHeadingText}>{'Name'}</Text>
                    <View>
                        <TextInput
                            placeholder="Enter Name"
                            style={styles.inputBox}
                            onChangeText={productFormik.handleChange('name')}
                            onBlur={productFormik.handleBlur('name')}
                            value={productFormik.values.name}
                        />
                        {!productFormik.isValid && (
                            <Text style={{ color: 'red' }}>{productFormik.errors.name}</Text>
                        )}
                    </View>
                </View>

                <View style={{ marginTop: 20 }}>
                    <Text style={styles.inputBoxHeadingText}>{'Price'}</Text>
                    <View>
                        <TextInput
                            placeholder="Enter Price"
                            style={styles.inputBox}
                            onChangeText={productFormik.handleChange('price')}
                            onBlur={productFormik.handleBlur('price')}
                            value={productFormik.values.price}
                            keyboardType="phone-pad"
                            maxLength={6}
                        />
                        {!productFormik.isValid && (
                            <Text style={{ color: 'red' }}>{productFormik.errors.price}</Text>
                        )}
                    </View>
                </View>

                <View style={{ marginTop: 20 }}>
                    <Text style={styles.inputBoxHeadingText}>{'Quantity'}</Text>
                    <View>
                        <TextInput
                            placeholder="Enter Quantity"
                            style={styles.inputBox}
                            onChangeText={productFormik.handleChange('quantity')}
                            onBlur={productFormik.handleBlur('quantity')}
                            value={productFormik.values.quantity}
                            keyboardType="phone-pad"
                            maxLength={6}
                        />
                        {!productFormik.isValid && (
                            <Text style={{ color: 'red' }}>
                                {productFormik.errors.quantity}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={{ marginTop: 20 }}>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '500',
                            color: 'black',
                            marginBottom: 5,
                        }}>
                        {'Supplier:'}
                    </Text>
                    {supplierDetails == null ? (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
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
                                onPress={() => {
                                    setOpenSearchSupplier(true);
                                }}>
                                <Icon name="search" size={22} color="#9900F0" />
                                <Text style={{ fontSize: 15, paddingLeft: 7 }}>
                                    {'Search from parties'}
                                </Text>
                            </TouchableOpacity>
                            <View
                                style={{
                                    borderRightWidth: 1,
                                    height: '90%',
                                    borderColor: '#DDDDDD',
                                    borderStyle: 'dashed',
                                }}
                            />
                            <TouchableOpacity
                                style={{
                                    paddingVertical: 5,
                                    width: '40%',
                                    backgroundColor: '#9900F0',
                                    borderRadius: 7,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onPress={() => {
                                    navigation.navigate('AddSupplier', {getSuppliersData: getSuppliersData, userId: userId});
                                }}>
                                <Text style={{ fontSize: 15, color: 'white', fontWeight: '500' }}>
                                    {'+ Add Supplier'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                            <View
                                style={{
                                    width: screenWidth * 0.8,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 10,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    elevation: 2,
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                }}>
                                <View style={{ width: '100%' }}>
                                    <View style={{ marginLeft: 15 }}>
                                        <Text
                                            style={{
                                                fontSize: 18,
                                                color: '#211951',
                                                fontWeight: '500',
                                            }}>
                                            {supplierDetails?.name}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                color: '#868686',
                                                letterSpacing: 1,
                                            }}>
                                            {'Phone No: ' + supplierDetails?.phoneNo}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setSupplierDetails(null);
                                }}>
                                <Entypo name="circle-with-cross" size={25} color={'#9900F0'} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <Modal visible={openSearchSupplier ? true : false} transparent={true}>
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
                visible={openSearchSupplier}
                transparent={true}
                animationType="slide">
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
                    }}>
                    <TouchableOpacity
                        style={{ position: 'absolute', top: 10, right: 10 }}
                        onPress={() => {
                            setSearchSupplierValue('');
                            setOpenSearchSupplier(false);
                            setSearchFilterChoice(false);
                        }}>
                        <Entypo name="cross" size={25} color={'black'} />
                    </TouchableOpacity>

                    <View>
                        <View
                            style={{
                                flexDirection: 'row',
                                marginTop: 30,
                                width: screenWidth * 0.95,
                                alignSelf: 'center',
                                justifyContent: 'space-between',
                            }}>
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
                                    style={{ fontSize: 16, paddingLeft: 10 }}
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
                                }}>
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
                                    onChange={value => {
                                        setSearchFilterChoice(value.value);
                                    }}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <ScrollView
                            style={{ height: screenHeight * 0.5 }}
                            showsVerticalScrollIndicator={false}>
                            {searchSupplierValue == ''
                                ? null
                                : allSupplierData.map(
                                    ({ name, phoneNo, supplierId }, index) => {
                                        if (searchFilterChoice) {
                                            if (
                                                !phoneNo
                                                    .toLowerCase()
                                                    .includes(searchSupplierValue.toLowerCase())
                                            )
                                                return;
                                        } else {
                                            if (
                                                !name
                                                    .toLowerCase()
                                                    .includes(searchSupplierValue.toLowerCase())
                                            )
                                                return;
                                        }

                                        return (
                                            <TouchableOpacity
                                                style={{
                                                    width: screenWidth * 0.95,
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
                                                    setSupplierDetails({ name: name, phoneNo: phoneNo, supplierId: supplierId });
                                                    setSearchSupplierValue('');
                                                    setOpenSearchSupplier(false);
                                                    setSearchFilterChoice(false);
                                                }}>
                                                <View style={{ width: '100%' }}>
                                                    <View style={{ marginLeft: 15 }}>
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
                                    },
                                )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity
                style={{
                    padding: 10,
                    width: screenWidth * 0.95,
                    backgroundColor: '#9900F0',
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',
                    marginBottom: 20,
                }}
                onPress={() => {
                    productFormik.handleSubmit(
                        productFormik.values.name,
                        productFormik.values.phoneNo,
                    );
                }}>
                <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>
                    {'Add Product'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddNewProduct;

const styles = StyleSheet.create({
    inputBoxHeadingText: {
        alignItems: 'center',
        color: '#211951',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        letterSpacing: 1,
    },
    inputBox: {
        alignItems: 'center',
        backgroundColor: 'white',
        fontSize: 16,
        borderColor: '#DDDDDD',
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 10,
    },
});
