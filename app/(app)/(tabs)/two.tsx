import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { FlatList, View } from 'react-native';

import SearchListItem from '~/components/SearchListItem';
import { useAuth } from '~/contexts/AuthContext';
import { Tables } from '~/types/supabase';
import { supabase } from '~/utils/supabase';

export default function Home() {
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
      .eq('is_tracked', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setHistory(data || []));
  };
  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Price alerts' }} />
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
