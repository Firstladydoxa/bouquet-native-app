import { SignOutButton } from "@/components/auth/SignOutButton";
import { SubscriptionProvider, useAuth } from "@/contexts";
import { useThemeColors } from "@/hooks/use-themed-styles";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router, usePathname } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";


const CustomDrawerContent = (props: any) => {
  const pathname = usePathname();
  const colors = useThemeColors();
  const { user } = useAuth();

  useEffect(() => {
    console.log(pathname);
  }, [pathname]);

  // Get user initials
  const getInitials = () => {
    if (!user) return "U";
    const firstInitial = user.firstname?.charAt(0)?.toUpperCase() || "";
    const lastInitial = user.lastname?.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}` || "U";
  };

  const getUserName = () => {
    if (!user) return "Guest";
    return `${user.firstname || ""} ${user.lastname || ""}`.trim() || "User";
  };

  const getUserEmail = () => {
    return user?.email || "guest@email.com";
  };

  const isRouteActive = (routePath: string) => {
    return pathname.includes(routePath);
  };

  const styles = StyleSheet.create({
    drawerStyle: {
      backgroundColor: colors.background,
    },
    navItem: {
      marginVertical: 4,
      marginHorizontal: 8,
      borderRadius: 8,
    },
    navItemActive: {
      backgroundColor: colors.primary + '15',
    },
    navItemLabel: {
      marginLeft: 5,
      fontSize: 16,
      fontWeight: '500',
    },
    userInfoWrapper: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 20,
      marginBottom: 8,
    },
    avatarContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.white,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.white + '40',
    },
    avatarText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
    },
    userDetailsWrapper: {
      marginLeft: 16,
      justifyContent: "center",
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.white,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: colors.white + 'CC',
    },
    drawerContentContainer: {
      flex: 1,
    },
    scrollViewContent: {
      paddingTop: 0,
    }
  });

  return (
    <View style={styles.drawerContentContainer}>
      {/** User Info Section - At the very top */}
      <View style={styles.userInfoWrapper}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <View style={styles.userDetailsWrapper}>
          <Text style={styles.userName}>{getUserName()}</Text>
          <Text style={styles.userEmail}>{getUserEmail()}</Text>
        </View>
      </View>

      <DrawerContentScrollView {...props} style={styles.drawerStyle} contentContainerStyle={styles.scrollViewContent}>

      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name="home"
            size={30}
            color={isRouteActive('/(tabs)') && !isRouteActive('/subscriptions') && !isRouteActive('/daily') ? colors.primary : colors.secondary}
          />
        )}
        label={"Home"}
        labelStyle={[
          styles.navItemLabel,
          { 
            color: isRouteActive('/(tabs)') && !isRouteActive('/subscriptions') && !isRouteActive('/daily') ? colors.secondary : colors.text,
            fontWeight: isRouteActive('/(tabs)') && !isRouteActive('/subscriptions') && !isRouteActive('/daily') ? '600' : '500'
          },
        ]}
        style={[
          styles.navItem,
          isRouteActive('/(tabs)') && !isRouteActive('/subscriptions') && !isRouteActive('/daily') && styles.navItemActive
        ]}
        onPress={() => {
          router.push("/(rhapsodylanguages)/(drawer)/(tabs)");
        }}
      />

      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name="person-circle"
            size={30}
            color={isRouteActive('/subscriptions') ? colors.primary : colors.secondary}
          />
        )}
        label={"Subscriptions"}
        labelStyle={[
          styles.navItemLabel,
          { 
            color: isRouteActive('/subscriptions') ? colors.secondary : colors.text,
            fontWeight: isRouteActive('/subscriptions') ? '600' : '500'
          },
        ]}
        style={[
          styles.navItem,
          isRouteActive('/subscriptions') && styles.navItemActive
        ]}
        onPress={() => {
          router.push("/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions");
        }}
      />
    

      <DrawerItem
        icon={({ color, size }) => (
          <Ionicons
            name="flag"
            size={30}
            color={isRouteActive('/alphabet') ? colors.primary : colors.secondary}
          />
        )}
        label={"Languages by alphabet"}
        labelStyle={[
          styles.navItemLabel,
          { 
            color: isRouteActive('/alphabet') ? colors.secondary : colors.text,
            fontWeight: isRouteActive('/alphabet') ? '600' : '500'
          },
        ]}
        style={[
          styles.navItem,
          isRouteActive('/alphabet') && styles.navItemActive
        ]}
        onPress={() => {
          router.push("/(rhapsodylanguages)/(drawer)/alphabet");
        }}
      />

      <DrawerItem
        label={"Languages by regions"}
        icon={({ color, size }) => (
          <Ionicons
            name="book"
            size={30}
            color={isRouteActive('/regions') ? colors.primary : colors.secondary}
          />
        )}
        
        labelStyle={[
          styles.navItemLabel,
          { 
            color: isRouteActive('/regions') ? colors.secondary : colors.text,
            fontWeight: isRouteActive('/regions') ? '600' : '500'
          },
        ]}
        style={[
          styles.navItem,
          isRouteActive('/regions') && styles.navItemActive
        ]}
        onPress={() => {
          router.push("/regions/list");
        }}
      />

      </DrawerContentScrollView>
    </View>
  );
};


export default function DrawerLayout() {
  const colors = useThemeColors();
  
  return (
    <SubscriptionProvider>
      <Drawer 
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerTintColor: colors.white,
          headerTitle: 'Rhapsody Languages',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 20, color: colors.white },
          headerStyle: { backgroundColor: colors.primary },
          headerRight: () => <SignOutButton />,
        }}
      >
        <Drawer.Screen
          name="alphabet/index"
          options={{drawerLabel: 'By alphabet', title: 'Alphabet'}}
        />
        <Drawer.Screen
          name="regions/index"
          options={{drawerLabel: 'By region', title: 'Regions'}}
        />
      </Drawer>
    </SubscriptionProvider>
  );
}


// Styles are now created dynamically within the CustomDrawerContent component
