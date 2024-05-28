import {View, Modal, Dimensions} from 'react-native';
import React from 'react';
import {BlurView} from '@react-native-community/blur';
import {DotIndicator} from 'react-native-indicators';

const Loader = ({isOpen}) => {
  const width = Dimensions.get('window').width;
  return (
    <>
      <Modal visible={isOpen} transparent>
        <View
          style={{
            flex: 1,
            paddingHorizontal: width * 0.03,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <BlurView
            overlayColor="rgba(0,0,0,0.2)"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
            blurAmount={5}
          />
          <DotIndicator color={'#9900F0'} size={12} />
        </View>
      </Modal>
    </>
  );
};

export default Loader;
