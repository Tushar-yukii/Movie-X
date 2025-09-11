import { View, Text, Image } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'

const Saved = () => {
  return (
    <View className="bg-primary flex-1 px-10">
          <View className="flex justify-start items-start flex-1 gap-6 flex-col">
            <Image source={icons.save} className="size-10" tintColor="#fff" />
            <Text className="text-gray-500 text-base">Save</Text>
          </View>
        </View>
  )
}

export default Saved