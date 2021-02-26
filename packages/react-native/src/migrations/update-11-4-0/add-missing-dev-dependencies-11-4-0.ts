import { addDepsToPackageJson } from '@nrwl/workspace';
import {
  metroVersion,
  reactNativeCommunityCli,
  reactNativeCommunityCliAndroid,
} from '../../utils/versions';

export default function update() {
  return addDepsToPackageJson(
    {},
    {
      '@react-native-community/cli': reactNativeCommunityCli,
      '@react-native-community/cli-platform-android': reactNativeCommunityCliAndroid,
      metro: metroVersion,
      'metro-resolver': metroVersion,
    }
  );
}
