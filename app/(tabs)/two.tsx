import { StyleSheet } from 'react-native';

import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import { createStyles } from '../../theme/useStyles';

export default function TabTwoScreen() {
  const styles = useStyles()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab Two</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
    </View>
  );
}

const useStyles = createStyles((theme) => { console.log(theme); return StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.text.xlBold
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
})});
