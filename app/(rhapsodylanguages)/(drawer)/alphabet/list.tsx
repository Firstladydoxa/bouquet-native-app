import CustomLoader from '@/components/ui/CustomLoader';
import { RhapsodyLanguagesAPI } from '@/services/rhapsodylanguagesApi';
import type { CountryData } from '@/types';
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';



export default function LanguagesByAlphabetScreenSample() {

    const { region } = useLocalSearchParams<{ region: string }>();

    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [countries, setCountries] = useState<CountryData[]>([]);


    const loadData = async () => {
        try {
            setLoading(true);
    
            const [countriesList] = await Promise.all([
                RhapsodyLanguagesAPI.fetchCountriesByRegion(region),
            ]);

            if (countriesList) {
                setCountries(countriesList);
            }
    
        } catch (error) {
            console.log("Error loading the data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        // await sleep(2000);
        await loadData();
        setRefreshing(false);
    };

    if (loading && !refreshing) return <CustomLoader message="Loading..." size="large" />;

    return (
        <>
          <Text>Alphabetical List</Text>
        </>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  regionsCardCol: {
    width: 280,
    height: 200,
    maxHeight: 200,
    marginHorizontal: 'auto',
    marginVertical: 10
  },
  regionsCardImage: {
    width: '100%',
    height: '100%',
    marginRight: '100%',
  },
});