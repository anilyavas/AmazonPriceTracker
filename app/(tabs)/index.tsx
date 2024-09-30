import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';

export default function Home() {
  const [input, setInput] = useState('');

  const performSearch = () => {
    console.warn('Search', input);
    //Search in db

    //Scrape amazon
    router.push('/search');
  };
  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <View className="flex-row gap-3 p-3">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Search for a product"
          className=" flex-1 rounded border border-gray-300 bg-white p-3"
        />
        <Pressable onPress={performSearch} className="rounded bg-teal-500 p-3">
          <Text>Search</Text>
        </Pressable>
      </View>
    </>
  );
}
