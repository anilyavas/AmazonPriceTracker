import { Octicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link, router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, TextInput, Pressable, Text, FlatList } from 'react-native';

import SearchListItem from '~/components/SearchListItem';
import { useAuth } from '~/contexts/AuthContext';
import { Tables } from '~/types/supabase';
import { supabase } from '~/utils/supabase';

dayjs.extend(relativeTime);

export default function Home() {
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<Tables<'searches'>[]>([]);
  const { user } = useAuth();

  const fetchHistory = () => {
    if (!user) {
      return;
    }
    supabase
      .from('searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setHistory(data || []));
  };
  useEffect(() => {
    fetchHistory();
  }, []);

  const performSearch = async () => {
    if (!user) {
      return;
    }
    //Search in db
    const { data, error } = await supabase
      .from('searches')
      .insert({
        query: search,
        user_id: user.id,
      })
      .select()
      .single();

    if (data) {
      console.log(data);
      router.push(`/search/${data.id}`);
    }

    if (error) {
      return console.warn(error.message);
    }

    //Scrape amazon
  };
  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Search' }} />
      <View className="flex-row gap-3 p-3">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search for a product"
          className=" flex-1 rounded border border-gray-300 bg-white p-3"
        />
        <Pressable onPress={performSearch} className="rounded bg-teal-500 p-3">
          <Text>Search</Text>
        </Pressable>
      </View>
      <FlatList
        data={history}
        contentContainerClassName="p-3 gap-2"
        onRefresh={fetchHistory}
        refreshing={false}
        renderItem={({ item }) => <SearchListItem item={item} />}
      />
    </View>
  );
}
