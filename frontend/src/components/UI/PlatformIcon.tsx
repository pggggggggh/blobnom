import {Image} from "@mantine/core";
import logo_boj from "/platforms/boj.png";
import logo_codeforces from "/platforms/codeforces.png";
import {Platform} from "../../types/enum/Platforms.tsx";

const platformLogos: Record<string, string> = {
    [Platform.BOJ]: logo_boj,
    [Platform.CODEFORCES]: logo_codeforces
};

interface PlatformIconProps {
    platform: Platform;
    w?: number;
}

const PlatformIcon = ({platform, w = 16}: PlatformIconProps) => {
    return <Image w={w} h={w} src={platformLogos[platform]}/>;
};

export default PlatformIcon;