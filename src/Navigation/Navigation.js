import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer, useLinkBuilder } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Screens/BottomTabs/Home';
import Parties from '../Screens/BottomTabs/Parties';
import Bills from '../Screens/BottomTabs/Bills';
import Inventory from '../Screens/BottomTabs/Inventory';
import Profile from '../Screens/BottomTabs/Profile';
import AddCustomer from '../Screens/PartiesScreens/AddCustomer';
import CreateBill from '../Screens/BillsScreens/CreateBill';
import SignUp from '../Screens/AuthScreens/SignUp';
import SplashScreen from '../Screens/SplashScreen';
import OtpVerify from '../Screens/AuthScreens/OtpVerify';
import Login from '../Screens/AuthScreens/Login';
import AddNewProduct from '../Screens/InventoryScreens/AddNewProduct';
import AddSupplier from '../Screens/PartiesScreens/AddSupplier';
import BillDetails from '../Screens/BillsScreens/BillDetails';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BottomNavigation = () => {
    return(
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#9900F0',
                tabBarInactiveTintColor: '#af6dff',
                tabBarStyle: {
                    height: '8%',
                },
                tabBarLabelStyle:{fontSize: 13, fontWeight:'bold'},

            }}
        >
            <Tab.Screen 
                name='Home' 
                component={Home} 
                options={{
                    headerShown: false,
                    tabBarIcon: ({focused}) => {
                        return (
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <View style={focused ? styles.bottomBarIconFocusedStyle : null}>
                                    <Image 
                                        source={
                                            focused 
                                            ? require('../assets/home.png') 
                                            : require('../assets/home-outline.png')
                                        } style={{height: 25, width: 25}}
                                    />
                                </View>
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen 
                name='Parties' 
                component={Parties} 
                options={{
                    headerShown: false,
                    tabBarIcon: ({focused}) => {
                        return (
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <View style={focused ? styles.bottomBarIconFocusedStyle : null}>
                                    <Image 
                                        source={
                                            focused 
                                            ? require('../assets/parties.png') 
                                            : require('../assets/parties-outline.png')
                                        } 
                                        style={{height: 25, width: 25}}
                                    />
                                </View>
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen 
                name='Bills' 
                component={Bills} 
                options={{
                    headerShown: false,
                    tabBarIcon: ({focused}) => {
                        return (
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <View style={focused ? styles.bottomBarIconFocusedStyle : null}>
                                    <Image 
                                        source={
                                            focused 
                                            ? require('../assets/bills.png') 
                                            : require('../assets/bills-outline.png')
                                        } 
                                        style={{height: 25, width: 25}}
                                    />
                                </View>
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen 
                name='Inventory' 
                component={Inventory} 
                options={{
                    headerShown: false,
                    tabBarIcon: ({focused}) => {
                        return (
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <View style={focused ? styles.bottomBarIconFocusedStyle : null}>
                                    <Image 
                                        source={
                                            focused 
                                            ? require('../assets/inventory.png') 
                                            : require('../assets/inventory-outline.png')
                                        } 
                                        style={{height: 25, width: 25}}
                                    />
                                </View>
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen 
                name='Profile' 
                component={Profile} 
                options={{
                    headerShown: false,
                    tabBarIcon: ({focused}) => {
                        return (
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <View style={focused ? styles.bottomBarIconFocusedStyle : null}>
                                    <Image 
                                        source={
                                            focused 
                                            ? require('../assets/profile.png') 
                                            : require('../assets/profile-outline.png')
                                        } 
                                        style={{height: 25, width: 25}}
                                    />
                                </View>
                            </View>
                        );
                    },
                }}
            />
        </Tab.Navigator>
    );
}

const Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name='SplashScreen' component={SplashScreen} options={{headerShown: false}}/>
                <Stack.Screen name='Login' component={Login} options={{headerShown: false}}/>
                <Stack.Screen name='SignUp' component={SignUp} options={{headerShown: false}}/>
                <Stack.Screen name='OtpVerify' component={OtpVerify} options={{headerShown: false}}/>
                <Stack.Screen name='BottomNavigation' component={BottomNavigation} options={{headerShown: false}}/>
                <Stack.Screen name='AddCustomer' component={AddCustomer} options={{headerTitle: 'Add Customer'}}/>
                <Stack.Screen name='AddSupplier' component={AddSupplier} options={{headerTitle: 'Add Supplier'}}/>
                <Stack.Screen name='AddNewProduct' component={AddNewProduct} options={{headerTitle: 'Add New Product'}}/>
                <Stack.Screen name='BillDetails' component={BillDetails} options={{headerTitle: 'Bill'}}/>
                <Stack.Screen name='CreateBill' component={CreateBill} options={{headerTitle: 'New Bill', headerTitleAlign: 'center'}}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Navigation

const styles = StyleSheet.create({
    bottomBarIconFocusedStyle: {
        backgroundColor: '#F1EAFF', 
        width: 50, 
        borderRadius: 10, 
        height: 35, 
        justifyContent: 'center', 
        alignItems: 'center'
    }
})