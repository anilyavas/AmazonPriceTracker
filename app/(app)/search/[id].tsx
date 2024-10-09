import { Octicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, Image, FlatList, Pressable, ActivityIndicator, Button } from 'react-native';

import { Tables } from '~/types/supabase';
import { supabase } from '~/utils/supabase';

dayjs.extend(relativeTime);

export default function SearchResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [search, setSearch] = useState<Tables<'searches'> | null>(null);
  const [products, setProducts] = useState<Tables<'products'>[]>([]);

  const fetchSearch = () => {
    supabase
      .from('searches')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => setSearch(data));
  };
  useEffect(() => {
    fetchSearch();
    fetchProducts();
  }, [id]);

  const fetchProducts = () => {
    supabase
      .from('product_search')
      .select('*,products(*)')
      .eq('search_id', id)
      .then(({ data }) =>
        setProducts(data?.map((d) => d.products).filter((p) => !!p) as Tables<'products'>[])
      );
  };

  useEffect(() => {
    const subscription = supabase
      .channel('supabase_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'searches' },
        (payload) => {
          if (payload.new?.id === parseInt(id, 10)) {
            setSearch(payload.new);
            fetchProducts();
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const startScraping = async () => {
    const { data, error } = await supabase.functions.invoke('scrape-start', {
      body: JSON.stringify({ record: search }),
    });
    console.log(data, error);
  };

  if (!search) {
    return <ActivityIndicator />;
  }

  const toggleIsTracked = async () => {
    if (!search?.id) {
      return;
    }
    const { data, error } = await supabase
      .from('searches')
      .update({ is_tracked: !search?.is_tracked })
      .eq('id', search.id)
      .select()
      .single();
    setSearch(data);
  };
  return (
    <View>
      <View className="m-2 gap-2 rounded bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className=" text-lg font-semibold">{search.query}</Text>
            <Text>{dayjs(search.created_at).fromNow()}</Text>
            <Text>{search.status}</Text>
          </View>
          <Octicons
            onPress={toggleIsTracked}
            name={search.is_tracked ? 'bell-fill' : 'bell'}
            size={22}
            color="dimgray"
          />
        </View>
        <Button title="Start scraping" onPress={startScraping} />
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.asin}
        contentContainerClassName="gap-2 p-2"
        renderItem={({ item }) => (
          <Link href={`/product/${item.asin}`} asChild>
            <Pressable
              //onPress={() => Linking.openURL(item.url)}
              className="flex-row items-center gap-2 bg-white p-3">
              <Image
                source={{ uri: item.image || '' }}
                className="h-20 w-20 "
                resizeMode="contain"
              />
              <Text className="flex-1" numberOfLines={4}>
                {item.name}
              </Text>
              <Text>$ {item.final_price}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
