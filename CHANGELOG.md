# Changelog

<!--
## [vx.x.x] - Not released yet

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security
-->

## [v3.3.0] - 2019-10-17

### Added

- Output profiles support
- SCAN_SESSION_NAME component
- Label for the QUANTITY and BARCODE component
- "Keep display on" option

### Changed

- Improve Send button reactiveness

### Fixed

- "Skip output" option

## [v3.2.0] - 2019-09-20

### Added

- Support for modifier keys (eg. TAB+Shift)
- HTTP component
- Append to CSV filename variables support

### Changed

- Improve Output components settings UI

## [v3.1.4] - 2019-08-26

### Added

- SkipOutput option for BARCODE and QUANTITY components
- Infinite loop detection

## [v3.1.3] - 2019-08-21

### Fixed

- Fix Android 9 connection issue

## [v3.1.2] - 2019-08-13

### Added

- "IF" and "ENDIF" Output components
- Option to choose the CSV delimiter
- Option to exclude non-text components from CSV

### Changed

- "Append to CSV" and "Export as CSV" now share the same options in the settings

### Fixed

- Issue with the DATE_TIME Output component
- Output template not updating when the app is inside the scanSession page

## [v3.1.1] - 2019-07-04

### Fixed

- "Append scan to csv" option enabling issue

## [v3.1.0] - 2019-05-19

### Added

- Output Profiles support (protocol only)
- Reflect the Output field in the "Export as CSV" option

## [v3.0.3] - 2019-03-07

### Fixed

- Multi-smartphone device_name variable

## [v3.0.2] - 2019-03-02

### Added

- Option to disable automatic updates
- Timeout dialog for continuosMode

### Fixed

- CSV file path auto-resettings issue
- DNSServiceRef is not initialized error

### Changed

- Minor UI enhancements

## [v3.0.1] - 2019-02-22

### Changed

- Converted Subscription plans to lifetime licenses

### Fixed

- scrollTop error

## [v3.0.0] - 2019-02-19

### Added

- Continuous mode
- Option to clear the server data
- Quantity output component
- Delay output component
- Other key output component (to press keys like F1, DEL, etc.)
- Append scannings to CSV file in realtime
- Auto reconnect when the IP address changes
- Minimization to tray icon
- Button to delete scan sessions from the server
- Support for CODE 32
- Settings to enable/disable scan formats
- Added a way to enter barcodes manually (by typing it)
- OTG support (Open a scan session, type the barcode and press the ENTER key)
- Repeat barcodes
- Archive barcodes
- Search (CTRL+F or CMD+F)
- Support for Chinese characters (Select clipboard typeMethod) thanks to KaiYi

### Fixed

- DATE, DATE_TIME, etc. variable 'unknown' issue
- Scan session name sync issue
- Minor UI enhancements

## [v2.0.0] - 2017-12-05

### Added

- Added a way to customize the typed string (eg. press two times ENTER, print the TIMESTAMP, replace a character, etc.)
- Landscape mode
- Tap to send the barcodes again
- Added an option to send a barcode manually (keyboard)
- Run on startup option

### Changed

- Improved multi-device connection
- Various UI enhancements

### Fixed

- Scan session name update problem
- Bonjour error

## [v1.1.0] - 2017-05-16

### Changed

- Included the Apple Bonjour installer

[v3.3.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.2.0...v3.3.0
[v3.2.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.1.4...v3.2.0
[v3.1.4]: https://github.com/fttx/barcode-to-pc-server/compare/v3.1.3...v3.1.4
[v3.1.3]: https://github.com/fttx/barcode-to-pc-server/compare/v3.1.2...v3.1.3
[v3.1.2]: https://github.com/fttx/barcode-to-pc-server/compare/v3.1.1...v3.1.2
[v3.1.1]: https://github.com/fttx/barcode-to-pc-server/compare/v3.1.0...v3.1.1
[v3.1.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.0.3...v3.1.0
[v3.0.3]: https://github.com/fttx/barcode-to-pc-server/compare/v3.0.2...v3.0.3
[v3.0.2]: https://github.com/fttx/barcode-to-pc-server/compare/v3.0.1...v3.0.2
[v3.0.1]: https://github.com/fttx/barcode-to-pc-server/compare/v2.0.0...v3.0.1
[v3.0.0]: https://github.com/fttx/barcode-to-pc-server/compare/v2.0.0...v3.0.0
[v2.0.0]: https://github.com/fttx/barcode-to-pc-server/compare/v1.1.0...v2.0.0
[v1.1.0]: https://github.com/fttx/barcode-to-pc-server/compare/v1.1.0-rc1...v1.1.0