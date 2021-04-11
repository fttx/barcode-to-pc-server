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


## [v3.14.0] - 2021-04-11

### Added

- Support for the "defaultValue" variable in the TEXT and NUMBER components
- Support for the "barcodes" variable

### Changed

- Improve buttons position

### Fixed

- Disappearing keyboard issue when using MANUAL INPUT mode
- DELAY component
- Sync button issue


## [v3.13.2] - 2021-03-07

### Fixed

- QR Code pairing issue


## [v3.13.1] - 2020-12-06

### Changed

- Minor UI fixes

### Removed

- Alert from CSV Output

### Fixed

- macOS Big Sur menu icon dark mode color


## [v3.13.0] - 2020-09-23

### Added

- ALERT component to show messages in the app
- More options for the HTTP component

### Removed

- FOCUS_WINDOW component

## [v3.12.0] - 2020-09-19

### Added

- FOCUS_WINDOW component
- Option to choose a delimiter character for the CSV_LOOKUP component
- Hide option to the tray icon (Linux only)
- Variables injection support for NUMBER and TEXT components

### Changed

- RUN, HTTP and CSV_LOOKUP Components are now executed synchronously
- You can now use run, http and csv_lookup variables
- Code Signing certificate
- Increased RUN Component output buffer

### Fixed

- Keyboard emulation issue with special characters (Linux only)
- Empty output when using CSV_LOOKUP
- Fix "enableTray" error

## [v3.11.2] - 2020-07-29

### Fixed

- "enableTray" error
- "image not found" error


## [v3.11.1] - 2020-07-06

### Added

- CSV_LOOKUP Skip Output option

## [v3.11.0] - 2020-07-04

### Added

- OCR support
- CSV_LOOKUP Component
- More CSV file name variables
- Vibration feedback option

### Changed

- Improve accessibility

### Fixed

- Keyboard input field issue

## [v3.10.0] - 2020-05-30

### Added

- "Default value" parameter for the NUMBER and TEXT components
- Filters for the BARCODE, NUMBER and TEXT components
- "Skip Output" option for the SELECT_OPTION component

### Changed

- HTTP component will now output the response data
- RUN component will now output the stdout value
- Improve UI usability & consistency
- Disable the CSV quotes by default

### Fixed

- Empty CSV lines issue

## [v3.9.0] - 2020-05-09

### Added

- BEEP Output Component
- SELECT_OPTION variable
- Option to execute commands when the smartphone power cord is plugged in
- More variables for the "Append to .csv file" option

### Changed

- The app will always display a space between Output components
- HTTP and RUN Components are now considered non-readable components
- The app will find only the servers that are the same subnet
- Improve UI performance when there are more scan sessions

### Fixed

- macOS window minimization issue

## [v3.8.0] - 2020-04-24

### Added

- TEXT component
- time and timestamp variables
- "Limit barcode formats" option for the BARCODE component

### Changed

- Renamed QUANTITY component to NUMBER
- UUID generation library
- Minor UX improvements

### Fixed

- macOS tray icon color

## [v3.7.0] - 2020-04-09

### Added

- Option to import and export Output templates

### Fixed

- Open the server "Minimized" option
- Issue with Manual Input that ignores the Enter key from OTG devices

## [v3.6.1] - 2020-02-01

### Fixed

- macOS JavaScript error

## [v3.6.0] - 2020-01-28

### Added

- Changelog dialog
- macOS executable notarization
- Support for special characters in the "Append to .CSV file" option

### Changed

- Improve performance when the server is minimized to tray
- Improve Save &amp; Apply button

### Fixed

- "Infinite loop" message false positives
- SELECT_OPTION empty output

## [v3.5.0] - 2019-12-28

### Added

- Option to skip the scan session name dialog
- Option to turn the torch on automatically
- CSV exporting options (app side)
- Offline server installer for Windows

## [v3.4.2] - 2019-11-17

### Fixed

- Acquisition issue when there is a "Default mode" selected

## [v3.4.0] - 2019-11-13

### Added

- RUN Output component
- SELECT_OPTION Output component
- "Start the app in Scan mode" option

### Changed

- Minor UX improvements

### Fixed

- Apple Bonjour error on Linux
- QUANTITY parameter Alert issue

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

[v3.14.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.13.2...v3.14.0
[v3.13.2]: https://github.com/fttx/barcode-to-pc-server/compare/v3.13.1...v3.13.2
[v3.13.1]: https://github.com/fttx/barcode-to-pc-server/compare/v3.13.0...v3.13.1
[v3.13.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.12.0...v3.13.0
[v3.12.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.11.2...v3.12.0
[v3.11.2]: https://github.com/fttx/barcode-to-pc-server/compare/v3.11.1...v3.11.2
[v3.11.1]: https://github.com/fttx/barcode-to-pc-server/compare/v3.11.0...v3.11.1
[v3.11.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.10.0...v3.11.0
[v3.10.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.9.0...v3.10.0
[v3.9.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.8.0...v3.9.0
[v3.8.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.7.0...v3.8.0
[v3.7.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.6.1...v3.7.0
[v3.6.1]: https://github.com/fttx/barcode-to-pc-server/compare/v3.6.0...v3.6.1
[v3.6.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.5.0...v3.6.0
[v3.5.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.4.2...v3.5.0
[v3.4.2]: https://github.com/fttx/barcode-to-pc-server/compare/v3.4.0...v3.4.2
[v3.4.0]: https://github.com/fttx/barcode-to-pc-server/compare/v3.3.0...v3.4.0
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