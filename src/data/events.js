import { getAssetUrl } from '../config/constants';

const sportEventsRaw = [
            { 
                title: 'Fun Football', 
                images: [
                'assets/media/sport_DSC_5282.jpg',
                'assets/media/sport_DSC_5283.jpg',
                'assets/media/sport_DSC_5287.jpg',
                'assets/media/sport_DSC_5290.jpg',
                'assets/media/sport_DSC_5292.jpg',
                'assets/media/sport_DSC_5294.jpg',
                'assets/media/sport_DSC_5304.jpg',
                'assets/media/sport_DSC_5307.jpg',
                'assets/media/sport_DSC_5314.jpg',
                'assets/media/sport_DSC_5316.jpg',
                'assets/media/sport_DSC_5317.jpg',
                'assets/media/sport_DSC_5319.jpg',
                'assets/media/sport_DSC_5320.jpg',
                'assets/media/sport_DSC_5321.jpg',
                'assets/media/sport_DSC_5322.jpg',
                'assets/media/sport_DSC_5323.jpg',
                'assets/media/sport_DSC_5325.jpg',
                'assets/media/sport_DSC_5332.jpg',
                'assets/media/sport_DSC_5333.jpg',
                'assets/media/sport_DSC_5336.jpg',
                'assets/media/sport_DSC_5338.jpg',
                'assets/media/sport_DSC_5339.jpg',
                'assets/media/sport_DSC_5341.jpg',
                'assets/media/sport_DSC_5357.jpg',
                'assets/media/sport_DSC_5361.jpg',
                'assets/media/sport_DSC_5291.jpg',
                'assets/media/sport_DSC_5296.jpg',
                'assets/media/sport_DSC_5298.jpg',
                'assets/media/sport_DSC_5300.jpg',
                'assets/media/sport_DSC_5302.jpg',
                'assets/media/sport_DSC_5318.jpg',
                'assets/media/sport_DSC_5329.jpg',
                'assets/media/sport_DSC_5334.jpg',
                'assets/media/sport_DSC_5340.jpg',
                'assets/media/sport_DSC_5362.jpg'
            ] 
            },
            { 
                title: 'Karate', 
                images: [
                'assets/media/sport_AUG 2024.mp4',
                'assets/media/sport_MRF_9269.jpg',
                'assets/media/sport_MRF_9286.jpg',
                'assets/media/sport_MRF_9309.jpg',
                'assets/media/sport_MRF_9325.jpg',
                'assets/media/sport_MRF_9476.jpg',
                'assets/media/sport_MRF_9521-2.jpg',
                'assets/media/sport_MRF_9531.jpg',
                'assets/media/sport_MRF_9558.jpg',
                'assets/media/sport_MRF_9597.jpg',
                'assets/media/sport_MRF_9607.jpg',
                'assets/media/sport_MRF_9644.jpg',
                'assets/media/sport_MRF_9685.jpg',
                'assets/media/sport_MRF_9687.jpg',
                'assets/media/sport_MRF_9729.jpg',
                'assets/media/sport_MRF_9759.jpg',
                'assets/media/sport_MRF_9781.jpg',
                'assets/media/sport_MRF_9792.jpg',
                'assets/media/sport_MRF_9206.jpg',
                'assets/media/sport_MRF_9251.jpg',
                'assets/media/sport_MRF_9254.jpg',
                'assets/media/sport_MRF_9310.jpg'
            ] 
            },
            { 
                title: 'Paintball', 
                images: [
                'assets/media/sport_Reunion and Paintball at Obelix Village.mp4',
                'assets/media/sport_MRF_8738.jpg',
                'assets/media/sport_MRF_8745.jpg',
                'assets/media/sport_MRF_8746.jpg',
                'assets/media/sport_MRF_8753.jpg',
                'assets/media/sport_MRF_8754.jpg',
                'assets/media/sport_MRF_8759.jpg',
                'assets/media/sport_MRF_8768.jpg',
                'assets/media/sport_MRF_8769.jpg',
                'assets/media/sport_MRF_8770.jpg',
                'assets/media/sport_MRF_8771.jpg',
                'assets/media/sport_MRF_8774.jpg',
                'assets/media/sport_MRF_8776.jpg',
                'assets/media/sport_MRF_8781.jpg',
                'assets/media/sport_MRF_8794.jpg',
                'assets/media/sport_MRF_8799.jpg',
                'assets/media/sport_MRF_8831.jpg',
                'assets/media/sport_MRF_8832.jpg',
                'assets/media/sport_MRF_8833.jpg',
                'assets/media/sport_MRF_8898.jpg',
                'assets/media/sport_MRF_8737.jpg',
                'assets/media/sport_MRF_8760.jpg',
                'assets/media/sport_MRF_8766.jpg',
                'assets/media/sport_MRF_8788.jpg',
                'assets/media/sport_MRF_8893.jpg',
                'assets/media/sport_MRF_8900.jpg'
            ] 
            },
            { 
                title: 'Pacuan Kuda', 
                images: [
                'assets/media/sport_DSC_6726.jpg',
                'assets/media/sport_DSC_6796.jpg',
                'assets/media/sport_DSC_6859.jpg',
                'assets/media/sport_DSC_6946.jpg',
                'assets/media/sport_DSC_6947.jpg',
                'assets/media/sport_DSC_6965.jpg',
                'assets/media/sport_DSC_6967.jpg',
                'assets/media/sport_DSC_6971.jpg',
                'assets/media/sport_DSC_6982.jpg',
                'assets/media/sport_DSC_6984.jpg',
                'assets/media/sport_DSC_6985.jpg',
                'assets/media/sport_DSC_6989.jpg',
                'assets/media/sport_DSC_6991.jpg',
                'assets/media/sport_DSC_6993.jpg',
                'assets/media/sport_DSC_6994.jpg',
                'assets/media/sport_DSC_7204.jpg',
                'assets/media/sport_DSC_7215.jpg',
                'assets/media/sport_DSC_7221.jpg',
                'assets/media/sport_DSC_7225.jpg',
                'assets/media/sport_DSC_7226.jpg',
                'assets/media/sport_DSC_7230.jpg',
                'assets/media/sport_DSC_7267.jpg',
                'assets/media/sport_DSC_7272.jpg',
                'assets/media/sport_DSC_7358.jpg',
                'assets/media/sport_DSC_7384.jpg',
                'assets/media/sport_DSC_7479.jpg',
                'assets/media/sport_DSC_7487.jpg',
                'assets/media/sport_DSC_7527.jpg',
                'assets/media/sport_DSC_7536.jpg'
            ] 
            },
        ];

const weddingEventsRaw = [
            { 
                title: 'Kompilasi Galeri Wedding', 
                images: [
                'assets/media/wedding_APK00154.jpg',
                'assets/media/wedding_APK00319.jpg',
                'assets/media/wedding_APK01483.jpg',
                'assets/media/wedding_MRF_2632.jpg',
                'assets/media/wedding_APK00149.jpg',
                'assets/media/wedding_APK00209.jpg',
                'assets/media/wedding_APK00333.jpg',
                'assets/media/wedding_APK00341.jpg',
                'assets/media/wedding_APK00392.jpg',
                'assets/media/wedding_APK00480.jpg',
                'assets/media/wedding_APK00790.jpg',
                'assets/media/wedding_APK00826.jpg',
                'assets/media/wedding_APK00877.jpg',
                'assets/media/wedding_APK00936.jpg',
                'assets/media/wedding_APK00977.jpg',
                'assets/media/wedding_APK01040.jpg',
                'assets/media/wedding_APK01084.jpg',
                'assets/media/wedding_APK01274.jpg',
                'assets/media/wedding_APK01376.jpg',
                'assets/media/wedding_APK01475.jpg',
                'assets/media/wedding_DCK09191.jpg',
                'assets/media/wedding_MRF_2575.jpg',
                'assets/media/wedding_MRF_2577.jpg',
                'assets/media/wedding_MRF_2582.jpg',
                'assets/media/wedding_MRF_2586.jpg',
                'assets/media/wedding_MRF_2591.jpg',
                'assets/media/wedding_MRF_2599.jpg',
                'assets/media/wedding_MRF_2606.jpg',
                'assets/media/wedding_MRF_2610.jpg',
                'assets/media/wedding_MRF_2611.jpg',
                'assets/media/wedding_MRF_2652.jpg',
                'assets/media/wedding_MRF_2674.jpg',
                'assets/media/wedding_MRF_2705.jpg',
                'assets/media/wedding_MRF_2714.jpg',
                'assets/media/wedding_MRF_2736.jpg',
                'assets/media/wedding_MRF_2738.jpg',
                'assets/media/wedding_MRF_2744.jpg'
            ] 
            },
            { 
                title: 'Resepsi Heri&Dini, 25 Agustus 2024', 
                images: [
                'assets/media/video_(16-9)_Resepsi Heri&Dini, 25 Agustus 2024.mp4',
                'assets/media/video_(2.35-1)_Resepsi Heri&Dini, 25 Agustus 2024.mp4'
            ] 
            },
            { 
                title: 'Wedding Aeni & Arif, 7 September 2024', 
                images: [
                'assets/media/video_(final 1 minutes)_Wedding Aeni & Arif, 7 September 2024.mp4'
            ] 
            },
            { 
                title: 'Anindita Galvin', 
                images: [
                'assets/media/video_Anindita Galvin.mp4'
            ] 
            },
            { 
                title: 'Wedding Ifani & Okky, 31 Mei 2025', 
                images: [
                'assets/media/video_Highlight_Wedding Ifani & Okky, 31 Mei 2025.mp4'
            ] 
            },
            { 
                title: 'Lamaran Ferry, 11 Juni 2024', 
                images: [
                'assets/media/video_Lamaran Ferry, 11 Juni 2024.mp4'
            ] 
            },
            { 
                title: 'PREWED MASJID KOTA GEDE', 
                images: [
                'assets/media/video_PREWED MASJID KOTA GEDE.mp4'
            ] 
            },
            { 
                title: 'The Wedding Ulfi & Hidayat ( 1 Minute Version )', 
                images: [
                'assets/media/video_The Wedding Ulfi & Hidayat ( 1 Minute Version ).mp4'
            ] 
            },
            { 
                title: 'The Wedding Ulfi & Hidayat ( 3 Minute Version )', 
                images: [
                'assets/media/video_The Wedding Ulfi & Hidayat ( 3 Minute Version ).mp4'
            ] 
            },
            { 
                title: 'Kompilasi Prewedding', 
                images: [
                'assets/media/wedding_DMH05569.jpg',
                'assets/media/wedding_DMH05580.jpg',
                'assets/media/wedding_DMH05584.jpg',
                'assets/media/wedding_DMH05586.jpg',
                'assets/media/wedding_DMH05627.jpg',
                'assets/media/wedding_DMH05628.jpg',
                'assets/media/wedding_DSC07437.jpg',
                'assets/media/wedding_DSC07439.jpg',
                'assets/media/wedding_DSC07447.jpg',
                'assets/media/wedding_DSC07476.jpg',
                'assets/media/wedding_DSC07496.jpg',
                'assets/media/wedding_DSC07502.jpg',
                'assets/media/wedding_DSC07526.jpg',
                'assets/media/wedding_DSC07539.jpg',
                'assets/media/wedding_MRF_6650.jpg',
                'assets/media/wedding_MRF_6651.jpg',
                'assets/media/wedding_MRF_6656.jpg',
                'assets/media/wedding_MRF_6693.jpg',
                'assets/media/wedding_MRF_6711.jpg',
                'assets/media/wedding_SFA04252.jpg',
                'assets/media/wedding_SFA04253.jpg',
                'assets/media/wedding_SFA04262.jpg',
                'assets/media/wedding_SFA04268.jpg',
                'assets/media/wedding_SFA04272.jpg',
                'assets/media/wedding_SFA04275.jpg',
                'assets/media/wedding_SFA04277.jpg',
                'assets/media/wedding_SFA04283.jpg',
                'assets/media/wedding_SFA04285.jpg',
                'assets/media/wedding_SFA04344.jpg',
                'assets/media/wedding_SFA04360.jpg',
                'assets/media/wedding_SFA04368.jpg',
                'assets/media/wedding_SFA04376.jpg',
                'assets/media/wedding_SFA04380.jpg',
                'assets/media/wedding_SFA04386.jpg',
                'assets/media/wedding_SFA04389.jpg',
                'assets/media/wedding_SFA04398.jpg',
                'assets/media/wedding_SFA04407.jpg',
                'assets/media/wedding_SFA04423.jpg',
                'assets/media/wedding_SFA04430.jpg'
            ] 
            },
        ];

export const sportEvents = sportEventsRaw.map(event => ({
    ...event,
    images: event.images.map(getAssetUrl)
}));

export const weddingEvents = weddingEventsRaw.map(event => ({
    ...event,
    images: event.images.map(getAssetUrl)
}));

