import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React from 'react'
import Navigation from './src/Navigation/Navigation'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

// theme - #9900F0

const App = () => {
  return (
    <>
      <StatusBar barStyle={'dark-content'} translucent backgroundColor={'transparent'}/>
      <GestureHandlerRootView style={{flex: 1}}>
        <Navigation />
      </GestureHandlerRootView>
    </>
  )
}

export default App

const styles = StyleSheet.create({})