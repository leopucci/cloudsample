import 'dart:convert';
import 'dart:io';
import 'package:device_info/device_info.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_facebook_login/flutter_facebook_login.dart';
import 'package:dio/src/options.dart' as dioOptions;
import 'package:pocketcloud/securestorage.dart';

class DioRequests {
  final SecureStorage secureStorage = SecureStorage();

  Dio initialDio() {
    Dio dio = new Dio(
      new BaseOptions(
          baseUrl: 'http://192.168.60.2:4000',
          connectTimeout: 5000,
          receiveTimeout: 3000,
          contentType: ContentType.json.toString(),
          responseType: ResponseType.json),
    );
    dio.interceptors
        .add(InterceptorsWrapper(onRequest: (options, handler) async {
      // Do something before request is sent
      Map<String, String> id = await _getId();
      options.headers['Authorization'] = 'Bearer : ' + id['id'];
      return handler.next(options); //continue
      // If you want to resolve the request with some custom data，
      // you can resolve a `Response` object eg: return `dio.resolve(response)`.
      // If you want to reject the request with a error message,
      // you can reject a `DioError` object eg: return `dio.reject(dioError)`
    }, onResponse: (response, handler) {
      // Do something with response data
      return handler.next(response); // continue
      // If you want to reject the request with a error message,
      // you can reject a `DioError` object eg: return `dio.reject(dioError)`
    }, onError: (DioError e, handler) async {
      if (DioErrorType.receiveTimeout == e.type ||
          DioErrorType.connectTimeout == e.type) {
        // throw CommunicationTimeoutException(
        //   "Server is not reachable. Please verify your internet connection and try again");
      } else if (DioErrorType.response == e.type) {
        if (e.response?.statusCode == 403 || e.response?.statusCode == 401) {
          await refreshToken();
          return _retry(e.requestOptions);
        }

        print('Dio Erro: ' + e.error);
        // 4xx 5xx response
        // throw exception...
        //

        return handler.resolve(e.response);
      } else if (DioErrorType.other == e.type) {
        print('socket ?');
        if (e.message.contains('SocketException')) {
          print('socket falhou');
          //throw CommunicationTimeoutException('blabla');
        }
      } else {
        // throw CommunicationException("Problem connecting to the server. Please try again.");
      }
      return handler.next(e); //continue
      // If you want to resolve the request with some custom data，
      // you can resolve a `Response` object eg: return `dio.resolve(response)`.
    }));
    return dio;
  }

  Dio getDio() {
    Dio dio = new Dio(new BaseOptions(
        baseUrl: 'http://192.168.60.2:4000',
        connectTimeout: 5000,
        receiveTimeout: 3000,
        contentType: ContentType.json.toString(),
        responseType: ResponseType.json));
    dio.interceptors
        .add(InterceptorsWrapper(onRequest: (options, handler) async {
      // Do something before request is sent
      options.headers['Authorization'] =
          'Bearer: ' + await secureStorage.readSecureData('accessToken');
      return handler.next(options); //continue
      // If you want to resolve the request with some custom data，
      // you can resolve a `Response` object eg: return `dio.resolve(response)`.
      // If you want to reject the request with a error message,
      // you can reject a `DioError` object eg: return `dio.reject(dioError)`
    }, onResponse: (response, handler) {
      // Do something with response data
      return handler.next(response); // continue
      // If you want to reject the request with a error message,
      // you can reject a `DioError` object eg: return `dio.reject(dioError)`
    }, onError: (DioError e, handler) async {
      if (DioErrorType.receiveTimeout == e.type ||
          DioErrorType.connectTimeout == e.type) {
        // throw CommunicationTimeoutException(
        //   "Server is not reachable. Please verify your internet connection and try again");
      } else if (DioErrorType.response == e.type) {
        if (e.response?.statusCode == 403 || e.response?.statusCode == 401) {
          await refreshToken();
          return _retry(e.requestOptions);
        }

        final snackBar = SnackBar(
          content: Text(e.error),
          action: SnackBarAction(
            label: 'Undo',
            onPressed: () {
              // Some code to undo the change.
            },
          ),
        );
        // 4xx 5xx response
        // throw exception...
        //

        return handler.resolve(e.response);
      } else if (DioErrorType.other == e.type) {
        if (e.message.contains('SocketException')) {
          print('socket falhou');
          //throw CommunicationTimeoutException('blabla');
        }
      } else {
        // throw CommunicationException("Problem connecting to the server. Please try again.");
      }
      return handler.next(e); //continue
      // If you want to resolve the request with some custom data，
      // you can resolve a `Response` object eg: return `dio.resolve(response)`.
    }));
    return dio;
  }

  Future sendError(String report) async {
    try {
      Response response = await Dio().post(
        'https://api.telegram.org/bot1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo/sendMessage?chat_id=@pocketcloudapp&text=message: $report',
      );

      print("RESPONSE TELEGErammmmm ====== ${response.data}");
    } catch (e) {
      throw e;
    }
  }

  Future<Response<dynamic>> _retry(RequestOptions requestOptions) async {
    final options = new dioOptions.Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
    );
    return getDio().request<dynamic>(requestOptions.path,
        data: requestOptions.data,
        queryParameters: requestOptions.queryParameters,
        options: options);
  }

  Future<void> refreshToken() async {
    final refreshToken = secureStorage.readSecureData('refreshToken');
    final response =
        await getDio().post('/users/refresh', data: {'token': refreshToken});

    if (response.statusCode == 200) {
      secureStorage.writeSecureData(
          'accessToken', response.data['accessToken']);
    }
  }

  Future<Map<String, String>> _getId() async {
    var deviceInfo = DeviceInfoPlugin();
    if (Platform.isIOS) {
      // import 'dart:io'
      var iosDeviceInfo = await deviceInfo.iosInfo;
      return {
        'id': iosDeviceInfo.identifierForVendor,
        'model': iosDeviceInfo.utsname.machine
      }; // unique ID on iOS
    } else {
      var androidDeviceInfo = await deviceInfo.androidInfo;
      return {
        'id': androidDeviceInfo.androidId,
        'model': androidDeviceInfo.model
      }; // unique ID onndroid
    }
  }

  Future<bool> registerNewFacebookCustomer(
      FacebookAccessToken accessToken, dynamic profile) async {
    Map<String, String> deviceId = await _getId();
    var formData = {
      'deviceId': deviceId['id'],
      'deviceModel': deviceId['model'],
      'accessToken': accessToken.token,
      'expires': accessToken.expires.toIso8601String(),
      'permissions': accessToken.permissions,
      'declinedPermissions': accessToken.declinedPermissions,
      'name': profile['name'],
      'first_name': profile['first_name'],
      'last_name': profile['last_name'],
      'email': profile['email'],
      'profileId': profile['id'],
      'pictureUrl': profile['picture']['data']['url']
    };
    final response =
        await initialDio().post('/users/register/facebook', data: formData);

    if (response.statusCode == 200) {
      print('Http 200 ok:');
      print('Dados Retornados:' + response.data.toString());
      sendError(
          "NOVO USUARIO RegisterNewFacebookCustomer(). Api retornou HTTP:" +
              response.statusCode.toString() +
              ' body: ' +
              response.data.toString());
      //print('Refresh Token:' + response.data['refreshToken']);
      secureStorage.writeSecureData('accessToken', response.data['jwtToken']);
      secureStorage.writeSecureData(
          'refreshToken', response.data['refreshToken']);
      return true;
    } else {
      sendError(
          "Erro na chamada registerNewFacebookCustomer(). Api retornou HTTP:" +
              response.statusCode.toString() +
              ' body: ' +
              response.data.toString());
    }
    return false;
  }
}
