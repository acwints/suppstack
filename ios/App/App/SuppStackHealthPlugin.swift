import Foundation
import HealthKit
import Capacitor

@objc(SuppStackHealthPlugin)
public class SuppStackHealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SuppStackHealthPlugin"
    public let jsName = "SuppStackHealth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSnapshot", returnType: CAPPluginReturnPromise)
    ]

    private let healthStore = HKHealthStore()

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve([
            "available": HKHealthStore.isHealthDataAvailable(),
            "platform": "ios"
        ])
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("Health data is not available on this device.")
            return
        }

        healthStore.requestAuthorization(toShare: [], read: readableTypes()) { success, error in
            DispatchQueue.main.async {
                if let error = error {
                    call.reject(error.localizedDescription)
                    return
                }

                call.resolve(["granted": success])
            }
        }
    }

    @objc func getSnapshot(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("Health data is not available on this device.")
            return
        }

        let days = min(max(call.getInt("days") ?? 14, 1), 90)
        let endDate = Date()
        let startDate = Calendar.current.date(byAdding: .day, value: -days, to: endDate) ?? endDate
        let group = DispatchGroup()

        var sleepHoursAvg: Double?
        var sleepQualityAvg: Double?
        var sleepDaysTracked: Int?
        var sleepDebtHours: Double?
        var sleepConsistencyScore: Double?
        var sleepRemHoursAvg: Double?
        var sleepDeepHoursAvg: Double?
        var sleepAwakeHoursAvg: Double?
        var weightKg: Double?
        var weightTrendKg: Double?
        var bodyFatPercent: Double?
        var bodyFatTrendPercent: Double?
        var activeEnergyBurnedKcalAvg: Double?
        var restingEnergyBurnedKcalAvg: Double?
        var stepsAvg: Double?
        var exerciseMinutesAvg: Double?
        var restingHeartRateBpmAvg: Double?
        var heartRateVariabilityMsAvg: Double?
        var vo2MaxMlKgMin: Double?

        group.enter()
        readSleepAverage(startDate: startDate, endDate: endDate, days: days) { hours, quality, trackedDays, debt, consistency, rem, deep, awake in
            sleepHoursAvg = hours
            sleepQualityAvg = quality
            sleepDaysTracked = trackedDays
            sleepDebtHours = debt
            sleepConsistencyScore = consistency
            sleepRemHoursAvg = rem
            sleepDeepHoursAvg = deep
            sleepAwakeHoursAvg = awake
            group.leave()
        }

        group.enter()
        readLatestAndTrend(
            identifier: .bodyMass,
            unit: .gramUnit(with: .kilo),
            multiplier: 1,
            startDate: startDate,
            endDate: endDate
        ) { latest, trend in
            weightKg = latest
            weightTrendKg = trend
            group.leave()
        }

        group.enter()
        readLatestAndTrend(
            identifier: .bodyFatPercentage,
            unit: .percent(),
            multiplier: 100,
            startDate: startDate,
            endDate: endDate
        ) { latest, trend in
            bodyFatPercent = latest
            bodyFatTrendPercent = trend
            group.leave()
        }

        group.enter()
        readCumulativeAverage(
            identifier: .activeEnergyBurned,
            unit: .kilocalorie(),
            startDate: startDate,
            endDate: endDate,
            days: days
        ) { value in
            activeEnergyBurnedKcalAvg = value
            group.leave()
        }

        group.enter()
        readCumulativeAverage(
            identifier: .basalEnergyBurned,
            unit: .kilocalorie(),
            startDate: startDate,
            endDate: endDate,
            days: days
        ) { value in
            restingEnergyBurnedKcalAvg = value
            group.leave()
        }

        group.enter()
        readCumulativeAverage(
            identifier: .stepCount,
            unit: .count(),
            startDate: startDate,
            endDate: endDate,
            days: days
        ) { value in
            stepsAvg = value
            group.leave()
        }

        group.enter()
        readCumulativeAverage(
            identifier: .appleExerciseTime,
            unit: .minute(),
            startDate: startDate,
            endDate: endDate,
            days: days
        ) { value in
            exerciseMinutesAvg = value
            group.leave()
        }

        group.enter()
        readDiscreteAverage(
            identifier: .restingHeartRate,
            unit: HKUnit.count().unitDivided(by: .minute()),
            startDate: startDate,
            endDate: endDate
        ) { value in
            restingHeartRateBpmAvg = value
            group.leave()
        }

        group.enter()
        readDiscreteAverage(
            identifier: .heartRateVariabilitySDNN,
            unit: HKUnit.secondUnit(with: .milli),
            startDate: startDate,
            endDate: endDate
        ) { value in
            heartRateVariabilityMsAvg = value
            group.leave()
        }

        group.enter()
        readDiscreteAverage(
            identifier: .vo2Max,
            unit: HKUnit(from: "ml/kg*min"),
            startDate: startDate,
            endDate: endDate
        ) { value in
            vo2MaxMlKgMin = value
            group.leave()
        }

        group.notify(queue: .main) {
            var result: JSObject = [
                "source": "apple_health",
                "dateRangeDays": days,
                "lastSyncedAt": ISO8601DateFormatter().string(from: Date())
            ]

            if let sleepHoursAvg = sleepHoursAvg { result["sleepHoursAvg"] = sleepHoursAvg }
            if let sleepQualityAvg = sleepQualityAvg { result["sleepQualityAvg"] = sleepQualityAvg }
            if let sleepDaysTracked = sleepDaysTracked { result["sleepDaysTracked"] = sleepDaysTracked }
            if let sleepDebtHours = sleepDebtHours { result["sleepDebtHours"] = sleepDebtHours }
            if let sleepConsistencyScore = sleepConsistencyScore {
                result["sleepConsistencyScore"] = sleepConsistencyScore
            }
            if let sleepRemHoursAvg = sleepRemHoursAvg { result["sleepRemHoursAvg"] = sleepRemHoursAvg }
            if let sleepDeepHoursAvg = sleepDeepHoursAvg { result["sleepDeepHoursAvg"] = sleepDeepHoursAvg }
            if let sleepAwakeHoursAvg = sleepAwakeHoursAvg { result["sleepAwakeHoursAvg"] = sleepAwakeHoursAvg }
            if let weightKg = weightKg { result["weightKg"] = weightKg }
            if let weightTrendKg = weightTrendKg { result["weightTrendKg"] = weightTrendKg }
            if let bodyFatPercent = bodyFatPercent { result["bodyFatPercent"] = bodyFatPercent }
            if let bodyFatTrendPercent = bodyFatTrendPercent { result["bodyFatTrendPercent"] = bodyFatTrendPercent }
            if let activeEnergyBurnedKcalAvg = activeEnergyBurnedKcalAvg {
                result["activeEnergyBurnedKcalAvg"] = activeEnergyBurnedKcalAvg
            }
            if let restingEnergyBurnedKcalAvg = restingEnergyBurnedKcalAvg {
                result["restingEnergyBurnedKcalAvg"] = restingEnergyBurnedKcalAvg
            }
            if let stepsAvg = stepsAvg { result["stepsAvg"] = stepsAvg }
            if let exerciseMinutesAvg = exerciseMinutesAvg {
                result["exerciseMinutesAvg"] = exerciseMinutesAvg
            }
            if let restingHeartRateBpmAvg = restingHeartRateBpmAvg {
                result["restingHeartRateBpmAvg"] = restingHeartRateBpmAvg
            }
            if let heartRateVariabilityMsAvg = heartRateVariabilityMsAvg {
                result["heartRateVariabilityMsAvg"] = heartRateVariabilityMsAvg
            }
            if let vo2MaxMlKgMin = vo2MaxMlKgMin { result["vo2MaxMlKgMin"] = vo2MaxMlKgMin }

            call.resolve(result)
        }
    }

    private func readableTypes() -> Set<HKObjectType> {
        var types = Set<HKObjectType>()

        [
            HKObjectType.quantityType(forIdentifier: .bodyMass),
            HKObjectType.quantityType(forIdentifier: .bodyFatPercentage),
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned),
            HKObjectType.quantityType(forIdentifier: .basalEnergyBurned),
            HKObjectType.quantityType(forIdentifier: .stepCount),
            HKObjectType.quantityType(forIdentifier: .appleExerciseTime),
            HKObjectType.quantityType(forIdentifier: .restingHeartRate),
            HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN),
            HKObjectType.quantityType(forIdentifier: .vo2Max)
        ].compactMap { $0 }.forEach { types.insert($0) }

        if let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) {
            types.insert(sleepType)
        }

        return types
    }

    private func readCumulativeAverage(
        identifier: HKQuantityTypeIdentifier,
        unit: HKUnit,
        startDate: Date,
        endDate: Date,
        days: Int,
        completion: @escaping (Double?) -> Void
    ) {
        guard let type = HKObjectType.quantityType(forIdentifier: identifier) else {
            completion(nil)
            return
        }

        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: endDate,
            options: .strictStartDate
        )
        let query = HKStatisticsQuery(
            quantityType: type,
            quantitySamplePredicate: predicate,
            options: .cumulativeSum
        ) { _, statistics, _ in
            guard let quantity = statistics?.sumQuantity() else {
                completion(nil)
                return
            }

            completion(quantity.doubleValue(for: unit) / Double(max(days, 1)))
        }

        healthStore.execute(query)
    }

    private func readDiscreteAverage(
        identifier: HKQuantityTypeIdentifier,
        unit: HKUnit,
        startDate: Date,
        endDate: Date,
        completion: @escaping (Double?) -> Void
    ) {
        guard let type = HKObjectType.quantityType(forIdentifier: identifier) else {
            completion(nil)
            return
        }

        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: endDate,
            options: .strictStartDate
        )
        let query = HKStatisticsQuery(
            quantityType: type,
            quantitySamplePredicate: predicate,
            options: .discreteAverage
        ) { _, statistics, _ in
            guard let quantity = statistics?.averageQuantity() else {
                completion(nil)
                return
            }

            completion(quantity.doubleValue(for: unit))
        }

        healthStore.execute(query)
    }

    private func readLatestAndTrend(
        identifier: HKQuantityTypeIdentifier,
        unit: HKUnit,
        multiplier: Double,
        startDate: Date,
        endDate: Date,
        completion: @escaping (Double?, Double?) -> Void
    ) {
        guard let type = HKObjectType.quantityType(forIdentifier: identifier) else {
            completion(nil, nil)
            return
        }

        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: endDate,
            options: .strictEndDate
        )
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: true)
        let query = HKSampleQuery(
            sampleType: type,
            predicate: predicate,
            limit: HKObjectQueryNoLimit,
            sortDescriptors: [sort]
        ) { _, samples, _ in
            let values = (samples as? [HKQuantitySample] ?? [])
                .map { $0.quantity.doubleValue(for: unit) * multiplier }

            guard let latest = values.last else {
                completion(nil, nil)
                return
            }

            let trend = values.count > 1 ? latest - (values.first ?? latest) : nil
            completion(latest, trend)
        }

        healthStore.execute(query)
    }

    private func readSleepAverage(
        startDate: Date,
        endDate: Date,
        days: Int,
        completion: @escaping (Double?, Double?, Int?, Double?, Double?, Double?, Double?, Double?) -> Void
    ) {
        guard let type = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            completion(nil, nil, nil, nil, nil, nil, nil, nil)
            return
        }

        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: endDate,
            options: .strictStartDate
        )
        let query = HKSampleQuery(
            sampleType: type,
            predicate: predicate,
            limit: HKObjectQueryNoLimit,
            sortDescriptors: nil
        ) { _, samples, _ in
            var asleepSecondsByWakeDay = [Date: TimeInterval]()
            var remSecondsByWakeDay = [Date: TimeInterval]()
            var deepSecondsByWakeDay = [Date: TimeInterval]()
            var awakeSecondsByWakeDay = [Date: TimeInterval]()
            var hasStageSamples = false

            for sample in samples as? [HKCategorySample] ?? [] {
                let wakeDay = Calendar.current.startOfDay(for: sample.endDate)
                let duration = sample.endDate.timeIntervalSince(sample.startDate)

                if self.isAsleepValue(sample.value) {
                    asleepSecondsByWakeDay[wakeDay, default: 0] += duration
                }

                if self.isRemValue(sample.value) {
                    remSecondsByWakeDay[wakeDay, default: 0] += duration
                    hasStageSamples = true
                }

                if self.isDeepValue(sample.value) {
                    deepSecondsByWakeDay[wakeDay, default: 0] += duration
                    hasStageSamples = true
                }

                if self.isAwakeValue(sample.value) {
                    awakeSecondsByWakeDay[wakeDay, default: 0] += duration
                    hasStageSamples = true
                }
            }

            let dailyHours = asleepSecondsByWakeDay.values.map { $0 / 3600 }.filter { $0 > 0 }

            guard !dailyHours.isEmpty else {
                completion(nil, nil, nil, nil, nil, nil, nil, nil)
                return
            }

            let totalHours = dailyHours.reduce(0, +)
            let trackedDays = dailyHours.count
            let averageHours = totalHours / Double(max(trackedDays, 1))
            let targetHours = 7.5
            let sleepDebt = max(0, targetHours * Double(trackedDays) - totalHours)
            let variance = dailyHours
                .map { pow($0 - averageHours, 2) }
                .reduce(0, +) / Double(max(trackedDays, 1))
            let standardDeviation = sqrt(variance)
            let consistencyScore = min(100, max(0, 100 - standardDeviation * 22 - abs(averageHours - targetHours) * 5))
            let remHours = remSecondsByWakeDay.values.reduce(0, +) / 3600
            let deepHours = deepSecondsByWakeDay.values.reduce(0, +) / 3600
            let awakeHours = awakeSecondsByWakeDay.values.reduce(0, +) / 3600
            let remAverage = hasStageSamples ? remHours / Double(max(trackedDays, 1)) : nil
            let deepAverage = hasStageSamples ? deepHours / Double(max(trackedDays, 1)) : nil
            let awakeAverage = hasStageSamples ? awakeHours / Double(max(trackedDays, 1)) : nil
            let durationQuality = min(5, max(1, (averageHours / 8) * 5))
            let quality: Double

            if hasStageSamples {
                let restorativeRatio = totalHours > 0 ? (remHours + deepHours) / totalHours : 0
                let stageBonus = min(0.8, restorativeRatio * 2)
                let wakePenalty = min(0.6, (awakeAverage ?? 0) * 0.45)
                quality = min(5, max(1, durationQuality + stageBonus - wakePenalty))
            } else {
                quality = durationQuality
            }

            completion(averageHours, quality, trackedDays, sleepDebt, consistencyScore, remAverage, deepAverage, awakeAverage)
        }

        healthStore.execute(query)
    }

    private func isAsleepValue(_ value: Int) -> Bool {
        if #available(iOS 16.0, *) {
            return value == HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue ||
                value == HKCategoryValueSleepAnalysis.asleepCore.rawValue ||
                value == HKCategoryValueSleepAnalysis.asleepDeep.rawValue ||
                value == HKCategoryValueSleepAnalysis.asleepREM.rawValue
        }

        return value == HKCategoryValueSleepAnalysis.asleep.rawValue
    }

    private func isRemValue(_ value: Int) -> Bool {
        if #available(iOS 16.0, *) {
            return value == HKCategoryValueSleepAnalysis.asleepREM.rawValue
        }

        return false
    }

    private func isDeepValue(_ value: Int) -> Bool {
        if #available(iOS 16.0, *) {
            return value == HKCategoryValueSleepAnalysis.asleepDeep.rawValue
        }

        return false
    }

    private func isAwakeValue(_ value: Int) -> Bool {
        return value == HKCategoryValueSleepAnalysis.awake.rawValue
    }
}
